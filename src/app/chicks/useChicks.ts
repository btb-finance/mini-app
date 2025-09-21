import { useState, useCallback, useEffect } from "react";
import { useAccount, useSendTransaction, usePublicClient, useWaitForTransactionReceipt } from "wagmi";
import { CHICKS_CONTRACT_ADDRESS, USDC_TOKEN_ADDRESS } from "./constants";
import chicksAbi from "./chicksabi.json";

export interface LoanDetails {
  collateral: number;
  borrowed: number;
  endDate: number;
  numberOfDays: number;
  isActive: boolean;
}

export interface UseChicksOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export function useChicks(options?: UseChicksOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null);
  const [isLoadingLoan, setIsLoadingLoan] = useState(false);
  const [chicksPrice, setChicksPrice] = useState<string>("0");
  
  const { address, isConnected } = useAccount();
  const { sendTransaction, data: txHash, error: txError } = useSendTransaction();
  const publicClient = usePublicClient();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // Helper function to update status and optionally trigger callbacks
  const updateStatus = useCallback((message: string, isError = false) => {
    setTxMessage(message);
    if (isError && options?.onError) {
      options.onError(new Error(message));
    } else if (!isError && message.includes("Success") && options?.onSuccess) {
      options.onSuccess(message);
    }
  }, [options]);

  // Get last price
  const getChicksPrice = useCallback(async () => {
    if (!publicClient) return "0";
    
    try {
      const result = await publicClient.readContract({
        address: CHICKS_CONTRACT_ADDRESS as `0x${string}`,
        abi: chicksAbi,
        functionName: "lastPrice",
        args: []
      });
      
      // The price is in USDC with 6 decimals
      const price = Number(result) / 10**6;
      setChicksPrice(price.toString());
      return price.toString();
    } catch (error) {
      console.error("Failed to get Chicks price:", error);
      return "0";
    }
  }, [publicClient]);

  // Get user's loan details
  const getLoanDetails = useCallback(async () => {
    if (!isConnected || !address || !publicClient) {
      console.log("Cannot get loan: Not connected, no address, or no client");
      return null;
    }
    
    try {
      setIsLoadingLoan(true);
      console.log("Getting loan for address:", address);
      
      const result = await publicClient.readContract({
        address: CHICKS_CONTRACT_ADDRESS as `0x${string}`,
        abi: chicksAbi,
        functionName: "Loans",
        args: [address]
      });
      
      console.log("Contract result:", result);
      
      // Check if the user has an active loan
      if (result && Array.isArray(result) && result.length >= 4) {
        const details: LoanDetails = {
          collateral: Number(result[0]) / 10**6, // USDC has 6 decimals
          borrowed: Number(result[1]) / 10**6,
          endDate: Number(result[2]),
          numberOfDays: Number(result[3]),
          isActive: Number(result[0]) > 0
        };
        
        console.log("Processed loan details:", details);
        setLoanDetails(details);
        return details;
      } else {
        console.error("Unexpected result format:", result);
        setLoanDetails(null);
        return null;
      }
    } catch (error) {
      console.error("Failed to get loan details:", error);
      setLoanDetails(null);
      return null;
    } finally {
      setIsLoadingLoan(false);
    }
  }, [isConnected, address, publicClient]);

  // Fetch loan details on component mount and when address changes
  useEffect(() => {
    if (isConnected && address) {
      getLoanDetails();
      getChicksPrice();
    } else {
      setLoanDetails(null);
    }
  }, [isConnected, address, getLoanDetails, getChicksPrice]);

  // Buy Chicks tokens
  const buyChicks = useCallback(async (usdcAmount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Approving token transfer...");
      
      // Calculate amount in wei (1 USDC = 10^6 wei for USDC)
      const amount = BigInt(Math.floor(parseFloat(usdcAmount) * 10**6));
      
      // First send approval transaction for ERC20 token
      sendTransaction({
        to: USDC_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${CHICKS_CONTRACT_ADDRESS.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });

      updateStatus("Waiting for approval confirmation...");

      // Wait for approval transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus("Approval confirmed!");
            resolve();
          } else if (txError) {
            reject(new Error(`Approval transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });

      updateStatus("Buying Chicks tokens...");

      // Then send the buy transaction
      sendTransaction({
        to: CHICKS_CONTRACT_ADDRESS,
        // buy(address receiver, uint256 _usdcAmount)
        data: `0xf088d547000000000000000000000000${address.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });

      // Wait for buy transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus(`Success! Bought Chicks tokens for ${usdcAmount} USDC.`);
            resolve();
          } else if (txError) {
            reject(new Error(`Buy transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus]);

  // Sell Chicks tokens
  const sellChicks = useCallback(async (chicksAmount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Selling Chicks tokens...");
      
      // Calculate amount in wei (Chicks has 18 decimals)
      const amount = BigInt(Math.floor(parseFloat(chicksAmount) * 10**18));
      
      // Send the sell transaction
      sendTransaction({
        to: CHICKS_CONTRACT_ADDRESS,
        // sell(uint256 chicks)
        data: `0xe4849b32${amount.toString(16).padStart(64, '0')}`,
      });

      // Wait for sell transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus(`Success! Sold ${chicksAmount} Chicks tokens.`);
            resolve();
          } else if (txError) {
            reject(new Error(`Sell transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus]);

  // Leverage (borrow)
  const leverage = useCallback(async (usdcAmount: string, numberOfDays: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Approving token transfer...");
      
      // Calculate amount in wei (1 USDC = 10^6 wei for USDC)
      const amount = BigInt(Math.floor(parseFloat(usdcAmount) * 10**6));
      const days = BigInt(parseInt(numberOfDays));
      
      // First send approval transaction for ERC20 token
      sendTransaction({
        to: USDC_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${CHICKS_CONTRACT_ADDRESS.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });

      updateStatus("Waiting for approval confirmation...");

      // Wait for approval transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus("Approval confirmed!");
            resolve();
          } else if (txError) {
            reject(new Error(`Approval transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });

      updateStatus("Creating leverage position...");

      // Then send the leverage transaction
      sendTransaction({
        to: CHICKS_CONTRACT_ADDRESS,
        // leverage(uint256 usdc, uint256 numberOfDays)
        data: `0x217b2920${amount.toString(16).padStart(64, '0')}${days.toString(16).padStart(64, '0')}`,
      });

      // Wait for leverage transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus(`Success! Created leverage position with ${usdcAmount} USDC collateral for ${numberOfDays} days.`);
            resolve();
          } else if (txError) {
            reject(new Error(`Leverage transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });

      // Refresh loan details after creation
      setTimeout(() => {
        getLoanDetails();
      }, 5000); // Wait 5 seconds before refreshing
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, getLoanDetails]);

  // Close position
  const closePosition = useCallback(async (repayAmount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Approving token transfer...");
      
      // Calculate amount in wei (1 USDC = 10^6 wei for USDC)
      const amount = BigInt(Math.floor(parseFloat(repayAmount) * 10**6));
      
      // First send approval transaction for ERC20 token
      sendTransaction({
        to: USDC_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${CHICKS_CONTRACT_ADDRESS.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });

      updateStatus("Waiting for approval confirmation...");

      // Wait for approval transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus("Approval confirmed!");
            resolve();
          } else if (txError) {
            reject(new Error(`Approval transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });

      updateStatus("Closing position...");

      // Then send the closePosition transaction
      sendTransaction({
        to: CHICKS_CONTRACT_ADDRESS,
        // closePosition(uint256 repayAmount)
        data: `0x11ca9167${amount.toString(16).padStart(64, '0')}`,
      });

      // Wait for close position transaction confirmation
      await new Promise<void>((resolve, reject) => {
        const checkConfirmation = () => {
          if (isSuccess) {
            updateStatus(`Success! Closed position by repaying ${repayAmount} USDC.`);
            resolve();
          } else if (txError) {
            reject(new Error(`Close position transaction failed: ${txError.message}`));
          } else {
            setTimeout(checkConfirmation, 1000);
          }
        };
        checkConfirmation();
      });

      // Refresh loan details after closing
      setTimeout(() => {
        getLoanDetails();
      }, 5000); // Wait 5 seconds before refreshing
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, getLoanDetails]);

  return {
    buyChicks,
    sellChicks,
    leverage,
    closePosition,
    getLoanDetails,
    getChicksPrice,
    isProcessing,
    txMessage,
    isConnected,
    loanDetails,
    isLoadingLoan,
    chicksPrice
  };
} 