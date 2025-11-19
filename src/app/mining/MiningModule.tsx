'use client';

import React from 'react';
import { useMiningOperations } from './useMiningOperations';
import { formatEther } from 'viem';
import { Loader2, Pickaxe, Timer, Trophy, Coins } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface MiningModuleProps {
    className?: string;
    isFullscreen?: boolean;
    onBack?: () => void;
}

export function MiningModule({ className = "", isFullscreen = false, onBack }: MiningModuleProps) {
    const {
        isConnected,
        selectedSquares,
        amountPerSquare,
        setAmountPerSquare,
        handleSquareClick,
        handleDeploy,
        handleClaim,
        roundInfo,
        minerStats,
        txMessage,
        isProcessing
    } = useMiningOperations();

    // Calculate total cost
    const totalCost = amountPerSquare && selectedSquares.length > 0
        ? (parseFloat(amountPerSquare) * selectedSquares.length).toFixed(6)
        : '0';

    // Format time remaining
    const getTimeRemaining = () => {
        if (!roundInfo || !roundInfo.timerStarted) return 'Waiting for start...';
        const now = Math.floor(Date.now() / 1000);
        const end = Number(roundInfo.endTime);
        const diff = end - now;

        if (diff <= 0) return 'Round Ended';
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className={cn(
            "w-full bg-background text-foreground",
            isFullscreen ? "min-h-screen p-4" : "rounded-xl",
            className
        )}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="relative text-center space-y-2 animate-fade-in">
                    {isFullscreen && onBack && (
                        <button
                            onClick={onBack}
                            className="absolute left-0 top-1 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            ← Back
                        </button>
                    )}
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight flex items-center justify-center gap-2">
                        <Pickaxe className="w-6 h-6 md:w-8 md:h-8 text-yellow-500" />
                        <span className="gradient-text">BTB Mining</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Deploy miners to squares and find the motherlode!
                    </p>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-slide-up">
                    <StatsCard
                        label="Round Pot"
                        value={`${roundInfo ? formatEther(roundInfo.totalDeployed) : '0'} ETH`}
                        icon={<Coins className="w-4 h-4 text-yellow-500" />}
                    />
                    <StatsCard
                        label="Time Left"
                        value={getTimeRemaining()}
                        icon={<Timer className="w-4 h-4 text-blue-500" />}
                    />
                    <StatsCard
                        label="Your ETH Rewards"
                        value={`${minerStats ? formatEther(minerStats.eth) : '0'} ETH`}
                        icon={<Trophy className="w-4 h-4 text-purple-500" />}
                    />
                    <StatsCard
                        label="Your BTB Rewards"
                        value={`${minerStats ? parseFloat(formatEther(minerStats.btb)).toFixed(2) : '0'} BTB`}
                        icon={<Pickaxe className="w-4 h-4 text-green-500" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Game Grid */}
                    <div className="lg:col-span-2 animate-scale-in">
                        <div className="glass rounded-2xl p-3 md:p-4 shadow-xl border border-white/10">
                            <div className="grid grid-cols-5 gap-1 md:gap-2 aspect-square">
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const isSelected = selectedSquares.includes(i);
                                    const deployedAmount = roundInfo?.deployed?.[i] || 0n;
                                    const hasDeployment = deployedAmount > 0n;
                                    const isWinning = roundInfo?.finalized && roundInfo.winningSquare === i;

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => handleSquareClick(i)}
                                            className={cn(
                                                "relative rounded-lg transition-all duration-200 flex flex-col items-center justify-center border",
                                                isSelected
                                                    ? "bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                                                    : hasDeployment
                                                        ? "bg-blue-500/10 border-blue-500/30"
                                                        : "bg-white/5 border-white/10 hover:bg-white/10",
                                                isWinning && "bg-green-500/50 border-green-500 animate-pulse shadow-[0_0_20px_rgba(34,197,94,0.5)]"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm md:text-lg font-bold",
                                                isSelected ? "text-yellow-500" : "text-gray-500"
                                            )}>
                                                {i + 1}
                                            </span>
                                            {hasDeployment && (
                                                <span className="text-[8px] md:text-[10px] text-blue-400 font-mono mt-0.5 md:mt-1">
                                                    {parseFloat(formatEther(deployedAmount)).toFixed(3)}
                                                </span>
                                            )}
                                            {isSelected && (
                                                <div className="absolute inset-0 border-2 border-yellow-500 rounded-lg animate-pulse" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-4 animate-slide-up">
                        <div className="glass rounded-2xl p-4 md:p-5 shadow-xl border border-white/10 space-y-4">
                            <h3 className="font-bold text-lg">Deploy Miners</h3>

                            <div className="space-y-2">
                                <label className="text-sm text-gray-400">ETH per Square</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={amountPerSquare}
                                        onChange={(e) => setAmountPerSquare(e.target.value)}
                                        placeholder="0.001"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-12 font-mono focus:outline-none focus:border-yellow-500/50 transition-all"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">ETH</span>
                                </div>
                            </div>

                            <div className="p-3 bg-white/5 rounded-xl space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Selected</span>
                                    <span className="font-bold">{selectedSquares.length} squares</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Cost</span>
                                    <span className="font-bold text-yellow-500">{totalCost} ETH</span>
                                </div>
                            </div>

                            <button
                                onClick={handleDeploy}
                                disabled={!isConnected || isProcessing || selectedSquares.length === 0 || !amountPerSquare}
                                className={cn(
                                    "w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all duration-200 relative overflow-hidden",
                                    !isConnected || selectedSquares.length === 0 || !amountPerSquare
                                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                                        : isProcessing
                                            ? "bg-yellow-600 cursor-wait"
                                            : "bg-gradient-to-r from-yellow-600 to-yellow-500 hover:shadow-yellow-500/25 hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </div>
                                ) : (
                                    'Deploy Miners'
                                )}
                            </button>

                            {txMessage && (
                                <div className={cn(
                                    "text-xs p-3 rounded-lg text-center animate-fade-in",
                                    txMessage.includes("Success") ? "bg-green-500/10 text-green-400" :
                                        txMessage.includes("Error") ? "bg-red-500/10 text-red-400" : "bg-blue-500/10 text-blue-400"
                                )}>
                                    {txMessage}
                                </div>
                            )}
                        </div>

                        {/* Claim Section */}
                        {(minerStats?.eth && minerStats.eth > 0n || minerStats?.btb && minerStats.btb > 0n) && (
                            <div className="glass rounded-2xl p-5 shadow-xl border border-white/10 space-y-4 animate-fade-in">
                                <h3 className="font-bold text-lg">Rewards</h3>
                                <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                                    <p className="text-sm text-green-400 text-center mb-2">You have unclaimed rewards!</p>
                                    <button
                                        onClick={handleClaim}
                                        disabled={isProcessing}
                                        className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold text-sm transition-colors"
                                    >
                                        Claim All Rewards
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="glass p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex items-center gap-2 mb-1">
                <div className="p-1.5 bg-white/5 rounded-lg">
                    {icon}
                </div>
                <span className="text-xs text-gray-400 font-medium">{label}</span>
            </div>
            <div className="text-lg font-bold tracking-tight pl-1 truncate">
                {value}
            </div>
        </div>
    );
}
