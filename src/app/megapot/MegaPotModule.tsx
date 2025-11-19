"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useMegaPot } from "./useMegaPot";
import {
  LOTTERY_CONTRACT_ADDRESS,
  DEFAULT_TICKET_COUNT,
  DEFAULT_DAYS_COUNT,
  DEFAULT_TICKETS_PER_DAY
} from "./constants";

export interface MegaPotModuleProps {
  className?: string;
  isFullscreen?: boolean;
  onBack?: () => void;
}

export function MegaPotModule({ className = "", isFullscreen = false, onBack }: MegaPotModuleProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'subscribe' | 'history'>('buy');
  const [ticketAmount, setTicketAmount] = useState(DEFAULT_TICKET_COUNT);
  const [ticketsPerDay, setTicketsPerDay] = useState(DEFAULT_TICKETS_PER_DAY);
  const [dayCount, setDayCount] = useState(DEFAULT_DAYS_COUNT);

  const {
    purchaseTickets,
    createSubscription,
    cancelSubscription,
    isProcessing,
    txMessage,
    isConnected,
    subscriptionDetails,
    isLoadingSubscription,
    getSubscriptionDetails
  } = useMegaPot();

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-950 to-black ${isFullscreen ? 'min-h-screen' : 'rounded-3xl shadow-2xl'} p-6 ${className}`}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        {isFullscreen && onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-blue-300 hover:text-white transition-colors group"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </button>
        )}

        {/* Premium Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-500/10 rounded-2xl mb-3 backdrop-blur-sm border border-blue-500/20 shadow-lg shadow-blue-500/10">
            <span className="text-4xl filter drop-shadow-lg">🎯</span>
          </div>
          <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">
            Mega Pot
          </h2>
          <p className="text-blue-200/70 text-sm font-medium tracking-wide uppercase">
            Weekly Lottery • 1 USDC Entry
          </p>
        </div>

        {/* Glass Navigation Tabs */}
        <div className="mb-8">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl p-1.5 mx-auto border border-white/10 shadow-xl" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'buy', label: 'Buy Tickets', icon: '🎟️' },
                { id: 'subscribe', label: 'Subscribe', icon: '🔄' },
                { id: 'history', label: 'My History', icon: '📜' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`py-3 px-2 text-xs sm:text-sm font-bold rounded-xl transition-all duration-300 flex flex-col sm:flex-row items-center justify-center gap-1.5 ${activeTab === tab.id
                      ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg scale-[1.02]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div className="relative">
          {activeTab === 'buy' && (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 mx-auto border border-white/10 shadow-2xl" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-white text-lg flex items-center">
                  <span className="w-1 h-6 bg-blue-500 rounded-full mr-3"></span>
                  Purchase Tickets
                </h3>
                <span className="text-xs font-mono text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
                  1 Ticket = 1 USDC
                </span>
              </div>

              <div className="mb-6">
                <Label htmlFor="ticket-amount" className="mb-3 block text-sm font-medium text-gray-300">
                  How many tickets?
                </Label>
                <div className="relative group">
                  <Input
                    id="ticket-amount"
                    type="number"
                    placeholder="1-1000"
                    className="bg-black/40 border-2 border-white/10 focus:border-blue-500/50 text-white p-4 rounded-xl w-full text-lg font-mono transition-all group-hover:border-white/20"
                    value={ticketAmount}
                    onChange={(e) => setTicketAmount(e.target.value)}
                    min="1"
                    max="1000"
                    disabled={isProcessing}
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium pointer-events-none">
                    TICKETS
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-5 mb-6 border border-blue-500/20">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-blue-300 mb-1 uppercase tracking-wider">Total Cost</p>
                    <p className="text-3xl font-black text-white tracking-tight">
                      {parseFloat(ticketAmount || "0")} <span className="text-lg font-medium text-blue-400">USDC</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-purple-300 mb-1">Potential Win</p>
                    <p className="text-xl font-bold text-purple-200">Unknown</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => purchaseTickets(ticketAmount)}
                disabled={isProcessing || !isConnected}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </span>
                ) : (
                  `Buy ${ticketAmount || '0'} Ticket${ticketAmount !== '1' ? 's' : ''} Now`
                )}
              </Button>
            </div>
          )}

          {activeTab === 'subscribe' && (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 mx-auto border border-white/10 shadow-2xl" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
              <h3 className="font-bold text-white text-lg mb-6 flex items-center">
                <span className="w-1 h-6 bg-green-500 rounded-full mr-3"></span>
                Auto-Play Subscription
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor="tickets-per-day" className="mb-2 block text-xs font-medium text-gray-300 uppercase tracking-wide">
                    Tickets / Day
                  </Label>
                  <Input
                    id="tickets-per-day"
                    type="number"
                    className="bg-black/40 border-2 border-white/10 focus:border-green-500/50 text-white p-3 rounded-xl w-full font-mono"
                    value={ticketsPerDay}
                    onChange={(e) => setTicketsPerDay(e.target.value)}
                    min="1"
                    max="100"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <Label htmlFor="day-count" className="mb-2 block text-xs font-medium text-gray-300 uppercase tracking-wide">
                    Duration (Days)
                  </Label>
                  <Input
                    id="day-count"
                    type="number"
                    className="bg-black/40 border-2 border-white/10 focus:border-green-500/50 text-white p-3 rounded-xl w-full font-mono"
                    value={dayCount}
                    onChange={(e) => setDayCount(e.target.value)}
                    min="1"
                    max="365"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-5 mb-6 border border-green-500/20">
                <p className="text-xs text-green-300 mb-1 uppercase tracking-wider">Total Subscription Cost</p>
                <p className="text-3xl font-black text-white tracking-tight">
                  {parseInt(ticketsPerDay || "0") * parseInt(dayCount || "0")} <span className="text-lg font-medium text-green-400">USDC</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => createSubscription(ticketsPerDay, dayCount)}
                  disabled={isProcessing || !isConnected}
                  className="py-3 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-xl shadow-lg shadow-green-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isProcessing ? 'Processing...' : 'Start Subscription'}
                </Button>

                <Button
                  onClick={cancelSubscription}
                  disabled={isProcessing || !isConnected || !subscriptionDetails?.isActive}
                  className="py-3 text-sm font-bold bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/10 transition-all"
                >
                  Cancel Active
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 mx-auto border border-white/10 shadow-2xl" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg flex items-center">
                  <span className="w-1 h-6 bg-purple-500 rounded-full mr-3"></span>
                  Subscription Status
                </h3>
                <button
                  onClick={getSubscriptionDetails}
                  disabled={isLoadingSubscription}
                  className="text-xs font-bold text-purple-400 hover:text-purple-300 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-colors"
                >
                  Refresh
                </button>
              </div>

              {isConnected ? (
                <>
                  {isProcessing ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p className="text-purple-200 font-medium">Processing Transaction...</p>
                    </div>
                  ) : txMessage ? (
                    <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${txMessage.includes("Success")
                        ? "bg-green-500/20 border-green-500/30 text-green-200"
                        : "bg-red-500/20 border-red-500/30 text-red-200"
                      }`}>
                      {txMessage}
                    </div>
                  ) : null}

                  {isLoadingSubscription ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Loading details...</p>
                    </div>
                  ) : subscriptionDetails ? (
                    subscriptionDetails.isActive ? (
                      <div className="space-y-4">
                        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-2xl p-5 border border-white/10">
                          <div className="flex justify-between items-center mb-4">
                            <span className="font-bold text-gray-300 text-sm uppercase tracking-wide">Status</span>
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg shadow-green-500/20 animate-pulse">ACTIVE</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 rounded-xl p-3">
                              <p className="text-gray-400 text-xs mb-1">Daily Tickets</p>
                              <p className="font-mono font-bold text-xl text-white">{subscriptionDetails.ticketsPerDay}</p>
                            </div>
                            <div className="bg-black/20 rounded-xl p-3">
                              <p className="text-gray-400 text-xs mb-1">Days Remaining</p>
                              <p className="font-mono font-bold text-xl text-white">{subscriptionDetails.daysRemaining}</p>
                            </div>
                          </div>

                          <Button
                            onClick={cancelSubscription}
                            className="mt-4 w-full py-3 text-sm font-bold bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 rounded-xl transition-all"
                            disabled={isProcessing}
                          >
                            Cancel Subscription
                          </Button>
                        </div>

                        <Button
                          onClick={() => setActiveTab('subscribe')}
                          className="w-full py-3 text-sm font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20"
                        >
                          Modify / Upgrade
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
                        <div className="text-4xl mb-3">😴</div>
                        <p className="font-bold text-white mb-1">No Active Subscription</p>
                        <p className="text-gray-400 text-sm mb-4">Automate your lottery entries today!</p>
                        <Button
                          onClick={() => setActiveTab('subscribe')}
                          className="py-2 px-6 text-sm font-bold bg-green-600 hover:bg-green-500 text-white rounded-xl shadow-lg shadow-green-500/20"
                        >
                          Create Subscription
                        </Button>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-400 mb-4 text-sm">Unable to load details</p>
                      <Button
                        onClick={getSubscriptionDetails}
                        className="py-2 px-6 text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
                      >
                        Retry
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-gray-300 font-medium mb-2">Wallet Not Connected</p>
                  <p className="text-gray-500 text-sm">Connect your wallet to view your history</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <a
            href={`https://basescan.org/address/${LOTTERY_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-mono text-gray-500 hover:text-blue-400 transition-colors bg-black/20 px-4 py-2 rounded-full border border-white/5 hover:border-blue-500/30"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            Contract: {LOTTERY_CONTRACT_ADDRESS.slice(0, 6)}...{LOTTERY_CONTRACT_ADDRESS.slice(-4)}
            <svg className="w-3 h-3 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

export default MegaPotModule; 