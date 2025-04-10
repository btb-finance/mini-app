import { useState, useCallback, useEffect } from "react";
import { useAccount, useSendTransaction, usePublicClient } from "wagmi";
import LOTTERY_CONTRACT_ADDRESS, { BTB_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS, TICKET_PRICE_USDC } from "./constants";
import lotteryAbi from "./lotteryabi.json";

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
  const { sendTransaction } = useSendTransaction();
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
      updateStatus("Approving token transfer...");
      
      // Calculate amount in wei (1 USDC = 10^6 wei for USDC)
      const amount = BigInt(Math.floor(parseFloat(ticketAmount) * 10**6));
      
      // First send approval transaction for ERC20 token
      await sendTransaction({
        to: USDC_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${LOTTERY_CONTRACT_ADDRESS.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });
      
      updateStatus("Waiting for approval confirmation...");
      // Delay to let the approval transaction propagate
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      updateStatus("Purchasing tickets...");
      // Then send the purchase transaction
      await sendTransaction({
        to: LOTTERY_CONTRACT_ADDRESS,
        // purchaseTicketsWithCashback(uint256 amount)
        data: `0x3a2d9e9f${amount.toString(16).padStart(64, '0')}`,
      });
      
      updateStatus(`Success! Purchased ${ticketAmount} tickets. View transaction on chain explorer.`);
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus]);

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
      
      // Calculate amount in wei (1 USDC = 10^6 wei for USDC)
      const amountInWei = BigInt(totalCost * 10**6);
      
      // First send approval transaction for ERC20 token
      await sendTransaction({
        to: USDC_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${LOTTERY_CONTRACT_ADDRESS.slice(2)}${amountInWei.toString(16).padStart(64, '0')}`,
      });
      
      updateStatus("Waiting for approval confirmation...");
      // Delay to let the approval transaction propagate
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      updateStatus("Creating subscription...");
      
      // Create the subscription
      // createSubscription(uint256 ticketsPerDay, uint256 daysCount)
      const ticketsPerDayHex = BigInt(ticketsPerDayVal).toString(16).padStart(64, '0');
      const daysHex = BigInt(daysVal).toString(16).padStart(64, '0');
      
      await sendTransaction({
        to: LOTTERY_CONTRACT_ADDRESS,
        data: `0xb7d3bc65${ticketsPerDayHex}${daysHex}`,
      });
      
      updateStatus(`Success! Created subscription for ${ticketsPerDay} tickets per day for ${daysCount} days.`);
      
      // Refresh subscription details after creation
      setTimeout(() => {
        getSubscriptionDetails();
      }, 5000); // Wait 5 seconds before refreshing to allow blockchain to update
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
    
    try {
      setIsProcessing(true);
      updateStatus("Cancelling subscription...");
      
      await sendTransaction({
        to: LOTTERY_CONTRACT_ADDRESS,
        // cancelSubscription()
        data: "0x78e70cf5",
      });
      
      updateStatus("Success! Subscription cancelled. Your refund will be processed.");
      
      // Clear current subscription data immediately
      setSubscriptionDetails(null);
      
      // Refresh subscription details after delay to allow chain to update
      setTimeout(() => {
        getSubscriptionDetails();
      }, 5000);
    } catch (error) {
      console.error("Failed to cancel subscription:", error);
      updateStatus(`Failed to cancel subscription: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, getSubscriptionDetails]);

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