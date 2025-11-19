import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount, usePublicClient } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { MINING_CONTRACT_ADDRESS, BTBMiningABI } from './constants';

export function useMiningOperations() {
    const { address, isConnected } = useAccount();
    const [selectedSquares, setSelectedSquares] = useState<number[]>([]);
    const [amountPerSquare, setAmountPerSquare] = useState<string>('');
    const [txMessage, setTxMessage] = useState<string | null>(null);

    // Contract Writes
    const {
        writeContract: writeDeploy,
        data: deployHash,
        isPending: isDeployPending,
        error: deployError
    } = useWriteContract();

    const {
        writeContract: writeClaim,
        data: claimHash,
        isPending: isClaimPending,
        error: claimError
    } = useWriteContract();

    // Transaction Receipts
    const { isLoading: isDeployConfirming, isSuccess: isDeploySuccess } = useWaitForTransactionReceipt({
        hash: deployHash,
    });

    const { isLoading: isClaimConfirming, isSuccess: isClaimSuccess } = useWaitForTransactionReceipt({
        hash: claimHash,
    });

    // Read Round Info
    const { data: currentRoundId } = useReadContract({
        address: MINING_CONTRACT_ADDRESS,
        abi: BTBMiningABI,
        functionName: 'currentRoundId',
    });

    const { data: roundData, refetch: refetchRound } = useReadContract({
        address: MINING_CONTRACT_ADDRESS,
        abi: BTBMiningABI,
        functionName: 'rounds',
        args: currentRoundId ? [currentRoundId] : undefined,
        query: {
            enabled: !!currentRoundId,
            refetchInterval: 5000, // Refresh every 5s
        }
    });

    // Read Miner Stats
    const { data: minerStats, refetch: refetchStats } = useReadContract({
        address: MINING_CONTRACT_ADDRESS,
        abi: BTBMiningABI,
        functionName: 'getMinerStats', // Using the view function that calculates totals
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: 10000,
        }
    });

    // Helpers
    const handleSquareClick = (squareId: number) => {
        if (selectedSquares.includes(squareId)) {
            setSelectedSquares(selectedSquares.filter(id => id !== squareId));
        } else {
            if (selectedSquares.length < 25) {
                setSelectedSquares([...selectedSquares, squareId]);
            }
        }
    };

    const handleDeploy = () => {
        if (!amountPerSquare || selectedSquares.length === 0) return;

        try {
            const weiAmount = parseEther(amountPerSquare);
            const totalValue = weiAmount * BigInt(selectedSquares.length);

            writeDeploy({
                address: MINING_CONTRACT_ADDRESS,
                abi: BTBMiningABI,
                functionName: 'deploy',
                args: [selectedSquares, weiAmount, '0x0000000000000000000000000000000000000000'], // No partner
                value: totalValue,
            });
        } catch (e) {
            console.error("Deploy error:", e);
        }
    };

    const handleClaim = () => {
        writeClaim({
            address: MINING_CONTRACT_ADDRESS,
            abi: BTBMiningABI,
            functionName: 'claimAll',
            args: [],
        });
    };

    // Status Updates
    useEffect(() => {
        if (isDeployPending) setTxMessage("Deploying miners...");
        else if (isDeployConfirming) setTxMessage("Confirming deployment...");
        else if (isDeploySuccess) {
            setTxMessage("Deployment successful!");
            setSelectedSquares([]);
            setAmountPerSquare('');
            refetchRound();
        }
        else if (deployError) setTxMessage(`Error: ${deployError.message.slice(0, 50)}...`);
    }, [isDeployPending, isDeployConfirming, isDeploySuccess, deployError, refetchRound]);

    useEffect(() => {
        if (isClaimPending) setTxMessage("Claiming rewards...");
        else if (isClaimConfirming) setTxMessage("Confirming claim...");
        else if (isClaimSuccess) {
            setTxMessage("Rewards claimed successfully!");
            refetchStats();
        }
        else if (claimError) setTxMessage(`Error: ${claimError.message.slice(0, 50)}...`);
    }, [isClaimPending, isClaimConfirming, isClaimSuccess, claimError, refetchStats]);

    // Parse Round Data
    // struct Round { id, startTime, endTime, deployed[25], minerCount[25], totalDeployed, ... }

    const roundDataTyped = roundData as [
        bigint, // id
        bigint, // startTime
        bigint, // endTime
        bigint[], // deployed
        bigint[], // minerCount
        bigint, // totalDeployed
        string, // entropyHash
        bigint, // totalWinnings
        bigint, // btbReward
        bigint, // totalMotherlodeReward
        number, // winningSquare
        number, // motherlodeTiersHit
        boolean, // finalized
        boolean, // isCheckpointable
        boolean, // isJackpotRound
        boolean, // timerStarted
        boolean  // finalizationRequested
    ] | undefined;

    const roundInfo = roundDataTyped ? {
        id: roundDataTyped[0],
        startTime: roundDataTyped[1],
        endTime: roundDataTyped[2],
        deployed: roundDataTyped[3],
        minerCount: roundDataTyped[4],
        totalDeployed: roundDataTyped[5],
        totalWinnings: roundDataTyped[7],
        btbReward: roundDataTyped[8],
        winningSquare: roundDataTyped[10],
        finalized: roundDataTyped[12],
        timerStarted: roundDataTyped[15],
    } : null;

    const minerStatsTyped = minerStats as [bigint, bigint, bigint, bigint] | undefined;

    return {
        isConnected,
        selectedSquares,
        amountPerSquare,
        setAmountPerSquare,
        handleSquareClick,
        handleDeploy,
        handleClaim,
        roundInfo,
        minerStats: minerStatsTyped ? {
            eth: minerStatsTyped[0],
            btb: minerStatsTyped[1]
        } : null,
        txMessage,
        isProcessing: isDeployPending || isDeployConfirming || isClaimPending || isClaimConfirming
    };
}
