'use client';

import React from 'react';
import { useTokenOperations } from './useTokenOperations';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { ArrowRightLeft, TrendingUp, Wallet, AlertCircle, Loader2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { TABS } from './constants';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface TokenModuleProps {
    className?: string;
    isFullscreen?: boolean;
    onBack?: () => void;
}

export function TokenModule({ className = "", isFullscreen = false, onBack }: TokenModuleProps) {
    const { isConnected } = useAccount();
    const {
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
        isPending,
        isSuccess,
        error
    } = useTokenOperations();

    const marketInfoTyped = marketInfo as [bigint, bigint, bigint, bigint, bigint] | undefined;
    const buyPreviewTyped = buyPreview as [bigint, bigint, bigint] | undefined;
    const sellPreviewTyped = sellPreview as [bigint, bigint, bigint] | undefined;

    const formatNumber = (val: bigint | undefined, decimals = 4) => {
        if (!val) return '0';
        return Number(formatEther(val)).toLocaleString(undefined, { maximumFractionDigits: decimals });
    };

    const formatPrice = (val: bigint | undefined) => {
        if (!val) return '0';
        return formatEther(val);
    };

    const currentBalance = (isBuy ? ethBalance?.value : tokenBalance) as bigint | undefined;
    const symbol = isBuy ? 'ETH' : 'BTB';

    const handleMax = () => {
        if (currentBalance) {
            if (isBuy) {
                const val = Number(formatEther(currentBalance)) - 0.001;
                setAmount(val > 0 ? val.toString() : '0');
            } else {
                setAmount(formatEther(currentBalance));
            }
        }
    };

    return (
        <div className={cn(
            "w-full bg-background text-foreground",
            isFullscreen ? "min-h-screen p-4" : "rounded-xl",
            className
        )}>
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header with Back Button */}
                <div className="relative text-center space-y-2 animate-fade-in">
                    {isFullscreen && onBack && (
                        <button
                            onClick={onBack}
                            className="absolute left-0 top-1 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 text-sm font-medium"
                        >
                            ← Back
                        </button>
                    )}
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
                        <span className="gradient-text">BTB Exchange</span>
                    </h1>
                    <p className="text-muted-foreground text-sm md:text-base">
                        Buy and Sell BTB tokens instantly
                    </p>
                </div>

                {/* Market Stats */}
                <div className="grid grid-cols-3 gap-2 md:gap-3 animate-slide-up">
                    <StatsCard
                        label="Price"
                        value={`${formatPrice(marketInfoTyped?.[0])} ETH`}
                        icon={<TrendingUp className="w-4 h-4 text-green-500" />}
                    />
                    <StatsCard
                        label="Supply"
                        value={`${formatNumber(marketInfoTyped?.[1], 0)} BTB`}
                        icon={<ArrowRightLeft className="w-4 h-4 text-blue-500" />}
                    />
                    <StatsCard
                        label="TVL"
                        value={`${formatNumber(marketInfoTyped?.[2])} ETH`}
                        icon={<Wallet className="w-4 h-4 text-purple-500" />}
                    />
                </div>

                {/* Main Trading Card */}
                <div className="max-w-md mx-auto animate-scale-in">
                    <div className="glass rounded-2xl p-4 md:p-5 shadow-xl border border-white/10 relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                        {/* Tabs */}
                        <div className="flex p-1 bg-black/20 rounded-xl mb-6 relative z-10">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setIsBuy(tab.id === 'buy');
                                        setAmount('');
                                    }}
                                    className={cn(
                                        "flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                                        (isBuy && tab.id === 'buy') || (!isBuy && tab.id === 'sell')
                                            ? "bg-white text-black shadow-lg scale-[1.02]"
                                            : "text-gray-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Input Section */}
                        <div className="space-y-4 relative z-10">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>You pay</span>
                                    <span className="flex items-center gap-1">
                                        Bal: {formatNumber(currentBalance)} {symbol}
                                        <button
                                            onClick={handleMax}
                                            className="text-primary hover:text-primary-light text-[10px] font-bold ml-1 px-1.5 py-0.5 bg-primary/10 rounded uppercase transition-colors"
                                        >
                                            Max
                                        </button>
                                    </span>
                                </div>

                                <div className="relative group">
                                    <input
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder="0.0"
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-3 pl-4 pr-16 text-xl font-bold focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-600"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className="text-base font-medium text-gray-400">{symbol}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Arrow Divider */}
                            <div className="flex justify-center -my-2 relative z-20">
                                <div className="bg-[#1A1E23] p-1.5 rounded-full border border-white/10 shadow-lg">
                                    <ArrowRightLeft className="w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            {/* Output Section */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>You receive (est.)</span>
                                </div>
                                <div className="w-full bg-black/20 border border-white/10 rounded-xl py-3 px-4 text-xl font-bold text-gray-300 cursor-not-allowed opacity-80">
                                    {isBuy
                                        ? formatNumber(buyPreviewTyped?.[0])
                                        : formatNumber(sellPreviewTyped?.[0])
                                    }
                                    <span className="text-base font-medium text-gray-500 ml-2">
                                        {isBuy ? 'BTB' : 'ETH'}
                                    </span>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-black/20 rounded-lg p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between text-gray-400">
                                    <span>Price Impact</span>
                                    <span className="text-green-400">&lt; 0.1%</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Fee</span>
                                    <span>{formatNumber(buyPreviewTyped?.[2] || sellPreviewTyped?.[2])} {isBuy ? 'ETH' : 'BTB'}</span>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => {
                                    if (!isConnected) return;
                                    if (needsApproval) handleApprove();
                                    else if (isBuy) handleBuy();
                                    else handleSell();
                                }}
                                disabled={!amount || isPending || !isConnected}
                                className={cn(
                                    "w-full py-3.5 rounded-xl font-bold text-base shadow-lg transition-all duration-200 relative overflow-hidden",
                                    !isConnected
                                        ? "bg-gray-600 cursor-not-allowed opacity-50"
                                        : isPending
                                            ? "bg-primary/80 cursor-wait"
                                            : "bg-gradient-to-r from-primary to-primary-light hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {isPending && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    </div>
                                )}

                                {!isConnected
                                    ? 'Connect Wallet'
                                    : needsApproval
                                        ? 'Approve BTB'
                                        : isBuy ? 'Buy BTB' : 'Sell BTB'
                                }
                            </button>

                            {/* Status Messages */}
                            {error && (
                                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2.5 rounded-lg animate-fade-in">
                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span className="truncate">{error.message.slice(0, 80)}...</span>
                                </div>
                            )}

                            {isSuccess && (
                                <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 p-2.5 rounded-lg animate-fade-in">
                                    <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" />
                                    <span>Transaction successful!</span>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="glass p-2 md:p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex flex-col md:flex-row items-center md:gap-2 mb-1">
                <div className="p-1 md:p-1.5 bg-white/5 rounded-lg mb-1 md:mb-0">
                    {icon}
                </div>
                <span className="text-[10px] md:text-xs text-gray-400 font-medium text-center md:text-left">{label}</span>
            </div>
            <div className="text-xs md:text-lg font-bold tracking-tight pl-1 text-center md:text-left truncate w-full">
                {value}
            </div>
        </div>
    );
}

export default TokenModule;
