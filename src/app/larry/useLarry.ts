import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useSendTransaction, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { parseEther, formatEther, encodeFunctionData } from 'viem';
import { LARRY_CONTRACT_ADDRESS, parseLarry, formatLarry, formatEth } from './constants';
import larryAbi from './larryabi.json';

export interface LoanData {
  collateral: bigint;
  borrowed: bigint;
  endDate: bigint;
  numberOfDays: bigint;
  isExpired?: boolean;
}

export interface LarryStats {
  totalSupply: bigint;
  backing: bigint;
  price: bigint;
  userBalance: bigint;
  buyFee: number;
  sellFee: number;
  leverageFee: number;
}

export const useLarry = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  const { sendTransaction, data: hash, isPending: isSending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read contract data
  const { data: totalSupply } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'totalSupply',
  });

  const { data: backing } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'getBacking',
  });

  const { data: lastPrice } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'lastPrice',
  });

  const { data: userBalance } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'balanceOf',
    args: [address],
  });

  const { data: buyFee } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'buy_fee',
  });

  const { data: sellFee } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'sell_fee',
  });

  const { data: leverageBuyFee } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'buy_fee_leverage',
  });

  const { data: userLoan } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'getLoanByAddress',
    args: [address],
  });

  const { data: totalBorrowed } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'getTotalBorrowed',
  });

  const { data: totalCollateral } = useReadContract({
    address: LARRY_CONTRACT_ADDRESS,
    abi: larryAbi,
    functionName: 'getTotalCollateral',
  });

  // Parse loan data
  const loanData: LoanData | null = userLoan && Array.isArray(userLoan) && userLoan[0] > 0n ? {
    collateral: userLoan[0] as bigint,
    borrowed: userLoan[1] as bigint,
    endDate: userLoan[2] as bigint,
    numberOfDays: 0n,
    isExpired: userLoan[2] < BigInt(Math.floor(Date.now() / 1000))
  } : null;

  // Buy Larry tokens
  const buyLarry = async (ethAmount: string) => {
    try {
      setError('');
      setStatus('Preparing buy transaction...');
      
      const value = parseEther(ethAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'buy',
          args: [address],
        }),
        value,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Buy failed');
      setStatus('');
    }
  };

  // Sell Larry tokens
  const sellLarry = async (larryAmount: string) => {
    try {
      setError('');
      setStatus('Preparing sell transaction...');
      
      const amount = parseLarry(larryAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'sell',
          args: [amount],
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sell failed');
      setStatus('');
    }
  };

  // Open leverage position
  const openLeverage = async (ethAmount: string, days: number) => {
    try {
      setError('');
      setStatus('Calculating leverage fee...');
      
      const ethValue = parseEther(ethAmount);
      
      // Get leverage fee
      const leverageFeeResult = await publicClient?.readContract({
        address: LARRY_CONTRACT_ADDRESS,
        abi: larryAbi,
        functionName: 'leverageFee',
        args: [ethValue, BigInt(days)],
      });
      
      const fee = leverageFeeResult as bigint;
      const overCollateral = ethValue / 100n; // 1% overcollateralization
      const totalRequired = fee + overCollateral;
      
      setStatus('Opening leverage position...');
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'leverage',
          args: [ethValue, BigInt(days)],
        }),
        value: totalRequired,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Leverage failed');
      setStatus('');
    }
  };

  // Borrow against Larry
  const borrow = async (ethAmount: string, days: number) => {
    try {
      setError('');
      setStatus('Preparing borrow transaction...');
      
      const amount = parseEther(ethAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'borrow',
          args: [amount, BigInt(days)],
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Borrow failed');
      setStatus('');
    }
  };

  // Borrow more on existing position
  const borrowMore = async (ethAmount: string) => {
    try {
      setError('');
      setStatus('Preparing borrow more transaction...');
      
      const amount = parseEther(ethAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'borrowMore',
          args: [amount],
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Borrow more failed');
      setStatus('');
    }
  };

  // Repay loan
  const repay = async (ethAmount: string) => {
    try {
      setError('');
      setStatus('Preparing repayment...');
      
      const value = parseEther(ethAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'repay',
        }),
        value,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Repayment failed');
      setStatus('');
    }
  };

  // Close position
  const closePosition = async () => {
    try {
      setError('');
      setStatus('Closing position...');
      
      if (!loanData) {
        throw new Error('No active position');
      }
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'closePosition',
        }),
        value: loanData.borrowed,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Close position failed');
      setStatus('');
    }
  };

  // Flash close position
  const flashClosePosition = async () => {
    try {
      setError('');
      setStatus('Flash closing position...');
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'flashClosePosition',
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Flash close failed');
      setStatus('');
    }
  };

  // Remove collateral
  const removeCollateral = async (larryAmount: string) => {
    try {
      setError('');
      setStatus('Removing collateral...');
      
      const amount = parseLarry(larryAmount);
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'removeCollateral',
          args: [amount],
        }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Remove collateral failed');
      setStatus('');
    }
  };

  // Extend loan
  const extendLoan = async (days: number) => {
    try {
      setError('');
      setStatus('Calculating extension fee...');
      
      if (!loanData) {
        throw new Error('No active loan');
      }
      
      const interestFee = await publicClient?.readContract({
        address: LARRY_CONTRACT_ADDRESS,
        abi: larryAbi,
        functionName: 'getInterestFee',
        args: [loanData.borrowed, BigInt(days)],
      });
      
      const fee = interestFee as bigint;
      
      setStatus('Extending loan...');
      
      sendTransaction({
        to: LARRY_CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: larryAbi,
          functionName: 'extendLoan',
          args: [BigInt(days)],
        }),
        value: fee,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extend loan failed');
      setStatus('');
    }
  };

  // Calculate buy amount
  const calculateBuyAmount = async (ethAmount: string): Promise<bigint> => {
    try {
      const value = parseEther(ethAmount);
      const result = await publicClient?.readContract({
        address: LARRY_CONTRACT_ADDRESS,
        abi: larryAbi,
        functionName: 'getBuyLARRY',
        args: [value],
      });
      return result as bigint;
    } catch {
      return 0n;
    }
  };

  // Calculate sell return
  const calculateSellReturn = async (larryAmount: string): Promise<bigint> => {
    try {
      const amount = parseLarry(larryAmount);
      const result = await publicClient?.readContract({
        address: LARRY_CONTRACT_ADDRESS,
        abi: larryAbi,
        functionName: 'LARRYtoETH',
        args: [amount],
      });
      return result as bigint;
    } catch {
      return 0n;
    }
  };

  // Update status based on transaction state
  useEffect(() => {
    if (isSending) {
      setStatus('Confirming transaction...');
    } else if (isConfirming) {
      setStatus('Transaction submitted, waiting for confirmation...');
    } else if (isSuccess) {
      setStatus('Transaction successful!');
      setError('');
      setTimeout(() => setStatus(''), 3000);
    }
  }, [isSending, isConfirming, isSuccess]);

  const stats: LarryStats = {
    totalSupply: (totalSupply as bigint) || 0n,
    backing: (backing as bigint) || 0n,
    price: (lastPrice as bigint) || 0n,
    userBalance: (userBalance as bigint) || 0n,
    buyFee: Number(buyFee || 0),
    sellFee: Number(sellFee || 0),
    leverageFee: Number(leverageBuyFee || 0),
  };

  return {
    // State
    status,
    error,
    isLoading: isSending || isConfirming,
    
    // Data
    stats,
    loanData,
    totalBorrowed: (totalBorrowed as bigint) || 0n,
    totalCollateral: (totalCollateral as bigint) || 0n,
    
    // Actions
    buyLarry,
    sellLarry,
    openLeverage,
    borrow,
    borrowMore,
    repay,
    closePosition,
    flashClosePosition,
    removeCollateral,
    extendLoan,
    
    // Calculations
    calculateBuyAmount,
    calculateSellReturn,
  };
};