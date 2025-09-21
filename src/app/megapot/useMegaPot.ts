import { useState, useCallback, useEffect } from "react";
import { useAccount, useSendTransaction, usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { LOTTERY_CONTRACT_ADDRESS, USDC_TOKEN_ADDRESS, TICKET_PRICE_USDC } from "./constants";
import lotteryAbi from "./lotteryabi.json";
import { encodeFunctionData, parseAbi } from "viem";

// ERC20 ABI for approve and allowance functions
const erc20Abi = parseAbi([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)'
]);

export interface SubscriptionDetails {
  ticketsPerDay: number;
  daysRemaining: number;
  lastProcessedBatchDay: number;
  isActive: boolean;
}

export interface UseMegaPotOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export function useMegaPot(options?: UseMegaPotOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);

  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, error: txError } = useSendTransaction();
  const publicClient = usePublicClient();

  // Helper function to update status and optionally trigger callbacks
  const updateStatus = useCallback((message: string, isError = false) => {
    setTxMessage(message);
    if (isError && options?.onError) {
      options.onError(new Error(message));
    } else if (!isError && message.includes("Success") && options?.onSuccess) {
      options.onSuccess(message);
    }
  }, [options]);

  // Get user's subscription details
  const getSubscriptionDetails = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      console.log("Cannot get subscription: Not connected, no address, or no client");
      return null;
    }
    
    try {
      setIsLoadingSubscription(true);
      console.log("Getting subscription for address:", address);
      
      // The contract's getSubscription function returns (uint256, uint256, uint256, bool)
      console.log("Calling contract at:", LOTTERY_CONTRACT_ADDRESS);
      const result = await publicClient.readContract({
        address: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
        abi: lotteryAbi,
        functionName: "getSubscription",
        args: [address]
      });
      
      console.log("Contract result:", result);
      
      // Safely extract values from the result
      // TypeScript might not recognize the structure correctly, so we handle it carefully
      if (result && Array.isArray(result) && result.length >= 4) {
        const details: SubscriptionDetails = {
          ticketsPerDay: Number(result[0] || 0),
          daysRemaining: Number(result[1] || 0),
          lastProcessedBatchDay: Number(result[2] || 0),
          isActive: Boolean(result[3])
        };
        
        console.log("Processed subscription details:", details);
        setSubscriptionDetails(details);
        return details;
      } else {
        console.error("Unexpected result format:", result);
        setSubscriptionDetails(null);
        return null;
      }
    } catch (error) {
      console.error("Failed to get subscription details:", error);
      setSubscriptionDetails(null);
      return null;
    } finally {
      setIsLoadingSubscription(false);
    }
  }, [isConnected, address, publicClient]);

  // Fetch subscription details on component mount and when address changes
  useEffect(() => {
    if (isConnected && address) {
      getSubscriptionDetails();
    } else {
      setSubscriptionDetails(null);
    }
  }, [isConnected, address, getSubscriptionDetails]);

  // Purchase lottery tickets
  const purchaseTickets = useCallback(async (ticketAmount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }

    try {
      setIsProcessing(true);

      // Calculate amount in USDC decimals (USDC has 6 decimals)
      const ticketCount = parseFloat(ticketAmount);
      const totalCostUSDC = ticketCount * TICKET_PRICE_USDC;
      const amount = BigInt(Math.floor(totalCostUSDC * 10**6));

      // Check current allowance
      updateStatus("Checking USDC allowance...");

      if (publicClient) {
        const currentAllowance = await publicClient.readContract({
          address: USDC_TOKEN_ADDRESS as `0x${string}`,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [address as `0x${string}`, LOTTERY_CONTRACT_ADDRESS as `0x${string}`]
        }) as bigint;

        // Only approve if current allowance is less than required amount
        if (currentAllowance < amount) {
          updateStatus("Approving USDC transfer...");

          // Encode the approve function call
          const approveData = encodeFunctionData({
            abi: erc20Abi,
            functionName: 'approve',
            args: [LOTTERY_CONTRACT_ADDRESS as `0x${string}`, amount]
          });

          // Send approval transaction for USDC token
          await new Promise<void>((resolve, reject) => {
            sendTransaction(
              {
                to: USDC_TOKEN_ADDRESS as `0x${string}`,
                data: approveData,
              },
              {
                onSuccess: async () => {
                  updateStatus("Waiting for approval confirmation...");
                  // Wait for the transaction to be processed
                  await new Promise(resolve => setTimeout(resolve, 15000));

                  // Verify the approval was successful by checking allowance again
                  const newAllowance = await publicClient.readContract({
                    address: USDC_TOKEN_ADDRESS as `0x${string}`,
                    abi: erc20Abi,
                    functionName: 'allowance',
                    args: [address as `0x${string}`, LOTTERY_CONTRACT_ADDRESS as `0x${string}`]
                  }) as bigint;

                  if (newAllowance < amount) {
                    reject(new Error("USDC approval failed. Please try again."));
                  } else {
                    resolve();
                  }
                },
                onError: (error) => {
                  reject(new Error(`Approval transaction failed: ${error.message}`));
                }
              }
            );
          });
        }
      }

      updateStatus("Purchasing tickets...");

      // Encode the purchase function call
      const purchaseData = encodeFunctionData({
        abi: lotteryAbi,
        functionName: 'purchaseTicketsWithCashback',
        args: [amount]
      });

      // Send the purchase transaction
      await new Promise<void>((resolve, reject) => {
        sendTransaction(
          {
            to: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
            data: purchaseData,
          },
          {
            onSuccess: async () => {
              updateStatus("Waiting for purchase confirmation...");
              // Wait for purchase transaction to be confirmed
              await new Promise(resolve => setTimeout(resolve, 15000));
              updateStatus(`Success! Purchased ${ticketAmount} tickets.`);
              resolve();
            },
            onError: (error) => {
              reject(new Error(`Purchase transaction failed: ${error.message}`));
            }
          }
        );
      });

      // Clear status after 5 seconds
      setTimeout(() => {
        setTxMessage("");
      }, 5000);
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, publicClient]);

  // Create lottery subscription
  const createSubscription = useCallback(async (ticketsPerDay: string, daysCount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Calculating subscription cost...");
      
      // Calculate total subscription cost
      const ticketsPerDayVal = parseInt(ticketsPerDay);
      const daysVal = parseInt(daysCount);
      const totalCost = ticketsPerDayVal * daysVal * TICKET_PRICE_USDC;
      
      updateStatus(`Approving ${totalCost} USDC for subscription...`);
      
      // Calculate amount in USDC decimals (USDC has 6 decimals)
      const amountInWei = BigInt(totalCost * 10**6);
      
      // Encode the approve function call
      const approveData = encodeFunctionData({
        abi: erc20Abi,
        functionName: 'approve',
        args: [LOTTERY_CONTRACT_ADDRESS as `0x${string}`, amountInWei]
      });
      
      // First send approval transaction for USDC token
      await new Promise<void>((resolve, reject) => {
        sendTransaction(
          {
            to: USDC_TOKEN_ADDRESS as `0x${string}`,
            data: approveData,
          },
          {
            onSuccess: async () => {
              updateStatus("Waiting for approval confirmation...");
              // Wait for approval transaction to be confirmed
              await new Promise(resolve => setTimeout(resolve, 15000));
              resolve();
            },
            onError: (error) => {
              reject(new Error(`Approval transaction failed: ${error.message}`));
            }
          }
        );
      });

      updateStatus("Creating subscription...");

      // Encode the createSubscription function call
      const subscriptionData = encodeFunctionData({
        abi: lotteryAbi,
        functionName: 'createSubscription',
        args: [BigInt(ticketsPerDayVal), BigInt(daysVal)]
      });

      // Create the subscription
      await new Promise<void>((resolve, reject) => {
        sendTransaction(
          {
            to: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
            data: subscriptionData,
          },
          {
            onSuccess: async () => {
              updateStatus("Waiting for subscription confirmation...");
              await new Promise(resolve => setTimeout(resolve, 15000));
              updateStatus(`Success! Created subscription for ${ticketsPerDay} tickets per day for ${daysCount} days.`);
              resolve();
            },
            onError: (error) => {
              reject(new Error(`Subscription transaction failed: ${error.message}`));
            }
          }
        );
      });
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setTxMessage("");
      }, 5000);
      
      // Refresh subscription details after creation
      setTimeout(() => {
        getSubscriptionDetails();
      }, 7000); // Wait 7 seconds before refreshing to allow blockchain to update
    } catch (error) {
      console.error("Subscription creation failed:", error);
      updateStatus(`Subscription failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, getSubscriptionDetails]);

  // Cancel lottery subscription
  const cancelSubscription = useCallback(async () => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    // Check if user has an active subscription
    if (!subscriptionDetails || !subscriptionDetails.isActive) {
      updateStatus("No active subscription to cancel", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Cancelling subscription...");
      
      // Encode the cancelSubscription function call
      const cancelData = encodeFunctionData({
        abi: lotteryAbi,
        functionName: 'cancelSubscription',
        args: []
      });
      
      await new Promise<void>((resolve, reject) => {
        sendTransaction(
          {
            to: LOTTERY_CONTRACT_ADDRESS as `0x${string}`,
            data: cancelData,
          },
          {
            onSuccess: async () => {
              updateStatus("Waiting for cancellation confirmation...");
              await new Promise(resolve => setTimeout(resolve, 15000));
              updateStatus("Success! Subscription cancelled.");
              resolve();
            },
            onError: (error) => {
              reject(new Error(`Cancellation transaction failed: ${error.message}`));
            }
          }
        );
      });
      
      // Clear current subscription data immediately
      setSubscriptionDetails(null);
      
      // Clear status after 5 seconds
      setTimeout(() => {
        setTxMessage("");
      }, 5000);
      
      // Refresh subscription details after delay to allow chain to update
      setTimeout(() => {
        getSubscriptionDetails();
      }, 7000);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      updateStatus(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, subscriptionDetails, sendTransaction, updateStatus, getSubscriptionDetails]);

  return {
    purchaseTickets,
    createSubscription,
    cancelSubscription,
    getSubscriptionDetails,
    subscriptionDetails,
    isLoadingSubscription,
    isProcessing,
    txMessage,
    isConnected
  };
} 