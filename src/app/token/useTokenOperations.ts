import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, useBalance } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { useState, useEffect } from 'react';
import BTBBondingCurveABI from './BTBBondingCurveABI.json';
import TokenABI from './tokenabi.json';
import { BONDING_CURVE_ADDRESS, BTB_TOKEN_ADDRESS } from './constants';

export const useTokenOperations = () => {
    const { address } = useAccount();
    const [amount, setAmount] = useState('');
    const [debouncedAmount, setDebouncedAmount] = useState('');
    const [isBuy, setIsBuy] = useState(true);

    // Debounce amount input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedAmount(amount);
        }, 500);
        return () => clearTimeout(timer);
    }, [amount]);

    const parsedAmount = debouncedAmount && !isNaN(Number(debouncedAmount))
        ? (isBuy ? parseEther(debouncedAmount) : parseEther(debouncedAmount)) // Both are 18 decimals
        : BigInt(0);

    // Market Info
    const { data: marketInfo, refetch: refetchMarketInfo } = useReadContract({
        address: BONDING_CURVE_ADDRESS,
        abi: BTBBondingCurveABI,
        functionName: 'getMarketInfo',
    });

    // Preview Buy
    const { data: buyPreview } = useReadContract({
        address: BONDING_CURVE_ADDRESS,
        abi: BTBBondingCurveABI,
        functionName: 'previewBuy',
        args: [parsedAmount],
        query: {
            enabled: isBuy && parsedAmount > BigInt(0),
        }
    });

    // Preview Sell
    const { data: sellPreview } = useReadContract({
        address: BONDING_CURVE_ADDRESS,
        abi: BTBBondingCurveABI,
        functionName: 'previewSell',
        args: [parsedAmount],
        query: {
            enabled: !isBuy && parsedAmount > BigInt(0),
        }
    });

    // Token Balance
    const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
        address: BTB_TOKEN_ADDRESS,
        abi: TokenABI,
        functionName: 'balanceOf',
        args: [address],
        query: {
            enabled: !!address,
        }
    });

    // ETH Balance
    const { data: ethBalance, refetch: refetchEthBalance } = useBalance({
        address: address,
    });

    // Allowance
    const { data: allowance, refetch: refetchAllowance } = useReadContract({
        address: BTB_TOKEN_ADDRESS,
        abi: TokenABI,
        functionName: 'allowance',
        args: [address, BONDING_CURVE_ADDRESS],
        query: {
            enabled: !!address && !isBuy,
        }
    });

    // Write Contracts
    const { writeContract: writeBuy, data: buyHash, isPending: isBuyPending, error: buyError } = useWriteContract();
    const { writeContract: writeSell, data: sellHash, isPending: isSellPending, error: sellError } = useWriteContract();
    const { writeContract: writeApprove, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract();

    // Wait for Transactions
    const { isLoading: isBuyConfirming, isSuccess: isBuySuccess } = useWaitForTransactionReceipt({ hash: buyHash });
    const { isLoading: isSellConfirming, isSuccess: isSellSuccess } = useWaitForTransactionReceipt({ hash: sellHash });
    const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

    // Refresh data on success
    useEffect(() => {
        if (isBuySuccess || isSellSuccess || isApproveSuccess) {
            refetchMarketInfo();
            refetchTokenBalance();
            refetchEthBalance();
            refetchAllowance();
            setAmount(''); // Reset input on success
        }
    }, [isBuySuccess, isSellSuccess, isApproveSuccess]);

    const handleBuy = () => {
        if (!amount || isNaN(Number(amount))) return;
        writeBuy({
            address: BONDING_CURVE_ADDRESS,
            abi: BTBBondingCurveABI,
            functionName: 'buy',
            value: parseEther(amount),
        });
    };

    const handleSell = () => {
        if (!amount || isNaN(Number(amount))) return;
        writeSell({
            address: BONDING_CURVE_ADDRESS,
            abi: BTBBondingCurveABI,
            functionName: 'sell',
            args: [parseEther(amount)],
        });
    };

    const handleApprove = () => {
        if (!amount || isNaN(Number(amount))) return;
        writeApprove({
            address: BTB_TOKEN_ADDRESS,
            abi: TokenABI,
            functionName: 'approve',
            args: [BONDING_CURVE_ADDRESS, parseEther(amount)],
        });
    };

    const needsApproval = !isBuy && parsedAmount > BigInt(0) && ((allowance as bigint) || BigInt(0)) < parsedAmount;

    return {
        amount,
        setAmount,
        isBuy,
        setIsBuy,
        marketInfo,
        buyPreview,
        sellPreview,
        tokenBalance,
        ethBalance,
        handleBuy,
        handleSell,
        handleApprove,
        needsApproval,
        isPending: isBuyPending || isSellPending || isApprovePending || isBuyConfirming || isSellConfirming || isApproveConfirming,
        isSuccess: isBuySuccess || isSellSuccess || isApproveSuccess,
        error: buyError || sellError || approveError,
    };
};
