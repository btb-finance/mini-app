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
    <div className={`p-4 bg-gradient-to-br from-yellow-50 to-red-50 dark:from-gray-900 dark:to-gray-800 rounded-xl w-full ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto rounded-none bg-white dark:bg-gray-900' : 'max-w-[400px] mx-auto'} text-sm ${className} shadow-lg border border-gray-200 dark:border-gray-700`}>
      {isFullscreen && (
        <div className="sticky top-0 left-0 right-0 bg-white dark:bg-gray-900 pt-2 pb-1 mb-2 z-10 border-b border-gray-200 dark:border-gray-800">
          <button 
            onClick={onBack}
            className="absolute top-2 left-2 flex items-center justify-center p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full shadow-sm text-black dark:text-white"
            aria-label="Back to home"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-center pt-1.5 pb-1 text-black dark:text-white">Mega Pot</h2>
        </div>
      )}
      
      {!isFullscreen && (
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-red-500 to-purple-600 dark:from-yellow-400 dark:via-red-400 dark:to-purple-400">🎯 Mega Pot</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Weekly Lottery - Win Big!</p>
        </div>
      )}
      
      <div className="mb-4 bg-gradient-to-r from-yellow-100 to-red-100 dark:from-yellow-900/30 dark:to-red-900/30 rounded-xl p-4 border border-yellow-200 dark:border-yellow-700 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <div className="text-center">
          <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center justify-center">
            <span className="text-2xl mr-2">🎰</span>
            Weekly Mega Pot Lottery
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            {isFullscreen ? "Enter the weekly prize draw for 1 USDC per ticket" : "Buy tickets to enter the weekly prize draw. 1 USDC per ticket."}
          </p>
          <div className="inline-flex items-center bg-gradient-to-r from-yellow-500 to-red-500 text-white text-xs font-bold px-3 py-2 rounded-full shadow-lg">
            <span className="mr-1">🏆</span>
            Weekly Drawings - Big Prizes!
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
          <div className="grid grid-cols-3 gap-1">
            <button
              className={`py-3 px-2 text-xs rounded-lg transition-all duration-200 flex flex-col items-center ${
                activeTab === 'buy'
                  ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('buy')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mb-1 ${activeTab === 'buy' ? 'text-white' : 'text-yellow-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <span className="font-medium">Buy Tickets</span>
            </button>
            <button
              className={`py-3 px-2 text-xs rounded-lg transition-all duration-200 flex flex-col items-center ${
                activeTab === 'subscribe'
                  ? 'bg-gradient-to-br from-green-500 to-teal-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('subscribe')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mb-1 ${activeTab === 'subscribe' ? 'text-white' : 'text-green-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Subscribe</span>
            </button>
            <button
              className={`py-3 px-2 text-xs rounded-lg transition-all duration-200 flex flex-col items-center ${
                activeTab === 'history'
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => setActiveTab('history')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mb-1 ${activeTab === 'history' ? 'text-white' : 'text-purple-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="font-medium">My Tickets</span>
            </button>
          </div>
        </div>
        
        {activeTab === 'buy' && (
          <>
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
              <h3 className="font-bold mb-3 text-gray-800 dark:text-white flex items-center">
                <span className="text-xl mr-2">🎟️</span>
                Buy Lottery Tickets
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  Each ticket costs 1 USDC
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  Weekly drawings with multiple winners
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">•</span>
                  More tickets = higher chances
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">•</span>
                  Instant ticket purchase
                </li>
              </ul>

              <div className="mb-4">
                <Label htmlFor="ticket-amount" className="font-semibold mb-2 block text-sm text-gray-700 dark:text-gray-300">
                  Number of Tickets
                </Label>
                <Input
                  id="ticket-amount"
                  type="number"
                  placeholder="Enter quantity (1-1000)"
                  style={{color: 'black', backgroundColor: 'white'}}
                  className="border-2 border-gray-200 dark:border-gray-600 focus:border-yellow-500 dark:focus:border-yellow-400 font-medium p-3 rounded-xl w-full text-sm dark:text-black transition-colors"
                  value={ticketAmount}
                  onChange={(e) => setTicketAmount(e.target.value)}
                  min="1"
                  max="1000"
                  disabled={isProcessing}
                />
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg p-4 mb-4 border border-yellow-100 dark:border-yellow-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost:</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{parseFloat(ticketAmount || "0")} USDC</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">≈ ${parseFloat(ticketAmount || "0")} USD</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => purchaseTickets(ticketAmount)}
                disabled={isProcessing || !isConnected}
                className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-500 to-red-500 hover:from-yellow-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🎫</span>
                    Buy {ticketAmount || '0'} Ticket{ticketAmount !== '1' ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
        
        {activeTab === 'subscribe' && (
          <>
            <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
              <h3 className="font-bold mb-3 text-gray-800 dark:text-white flex items-center">
                <span className="text-xl mr-2">🔄</span>
                Lottery Subscription
              </h3>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mb-4">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2 mt-0.5">•</span>
                  Automatic daily entries
                </li>
                <li className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-0.5">•</span>
                  Never miss a drawing
                </li>
                <li className="flex items-start">
                  <span className="text-purple-500 mr-2 mt-0.5">•</span>
                  Set it and forget it
                </li>
                <li className="flex items-start">
                  <span className="text-orange-500 mr-2 mt-0.5">•</span>
                  Cancel anytime
                </li>
              </ul>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="tickets-per-day" className="font-semibold mb-2 block text-sm text-gray-700 dark:text-gray-300">
                    Tickets Per Day
                  </Label>
                  <Input
                    id="tickets-per-day"
                    type="number"
                    placeholder="1-100"
                    style={{color: 'black', backgroundColor: 'white'}}
                    className="border-2 border-gray-200 dark:border-gray-600 focus:border-green-500 dark:focus:border-green-400 font-medium p-3 rounded-xl w-full text-sm dark:text-black transition-colors"
                    value={ticketsPerDay}
                    onChange={(e) => setTicketsPerDay(e.target.value)}
                    min="1"
                    max="100"
                    disabled={isProcessing}
                  />
                </div>

                <div>
                  <Label htmlFor="day-count" className="font-semibold mb-2 block text-sm text-gray-700 dark:text-gray-300">
                    Number of Days
                  </Label>
                  <Input
                    id="day-count"
                    type="number"
                    placeholder="1-365"
                    style={{color: 'black', backgroundColor: 'white'}}
                    className="border-2 border-gray-200 dark:border-gray-600 focus:border-teal-500 dark:focus:border-teal-400 font-medium p-3 rounded-xl w-full text-sm dark:text-black transition-colors"
                    value={dayCount}
                    onChange={(e) => setDayCount(e.target.value)}
                    min="1"
                    max="365"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-lg p-4 mb-4 border border-green-100 dark:border-green-800">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost:</span>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">{parseInt(ticketsPerDay || "0") * parseInt(dayCount || "0")} USDC</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">≈ ${parseInt(ticketsPerDay || "0") * parseInt(dayCount || "0")} USD</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => createSubscription(ticketsPerDay, dayCount)}
                  disabled={isProcessing || !isConnected}
                  className="py-3 text-sm font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✨</span>
                      Create Subscription
                    </>
                  )}
                </Button>

                <Button
                  onClick={cancelSubscription}
                  disabled={isProcessing || !isConnected || !subscriptionDetails?.isActive}
                  className="py-3 text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">❌</span>
                  Cancel Subscription
                </Button>
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-4 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                <span className="text-xl mr-2">🎫</span>
                My Lottery Subscription
              </h3>
              <button
                onClick={getSubscriptionDetails}
                disabled={isLoadingSubscription}
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 flex items-center font-medium"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {isConnected ? (
              <>
                {isProcessing ? (
                  <div className="text-center py-6">
                    <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">Processing...</p>
                  </div>
                ) : txMessage ? (
                  <div className={`p-3 rounded-lg mb-4 text-sm ${txMessage.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"}`}>
                    {txMessage}
                  </div>
                ) : null}

                {isLoadingSubscription ? (
                  <div className="text-center py-6">
                    <div className="animate-spin h-8 w-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-gray-800 dark:text-gray-200 text-sm">Loading subscription details...</p>
                  </div>
                ) : subscriptionDetails ? (
                  subscriptionDetails.isActive ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-200 dark:border-green-700">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-bold text-green-800 dark:text-green-200 text-sm">Active Subscription</span>
                          <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Tickets Per Day</p>
                            <p className="font-bold text-lg text-green-800 dark:text-green-200">{subscriptionDetails.ticketsPerDay}</p>
                          </div>
                          <div className="bg-white dark:bg-gray-700 p-3 rounded-lg">
                            <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Days Remaining</p>
                            <p className="font-bold text-lg text-green-800 dark:text-green-200">{subscriptionDetails.daysRemaining}</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-white dark:bg-gray-700 rounded-lg">
                          <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">Total Remaining Tickets</p>
                          <p className="font-bold text-xl text-green-800 dark:text-green-200">{subscriptionDetails.ticketsPerDay * subscriptionDetails.daysRemaining}</p>
                        </div>

                        <Button
                          onClick={cancelSubscription}
                          className="mt-4 w-full py-3 text-sm font-bold bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          <span className="mr-2">❌</span>
                          Cancel Subscription
                        </Button>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
                        <h4 className="font-bold mb-2 text-blue-800 dark:text-blue-200 text-sm flex items-center">
                          <span className="mr-2">🚀</span>
                          Want to Upgrade?
                        </h4>
                        <p className="text-sm mb-3 text-blue-700 dark:text-blue-300">You can increase your tickets per day or extend your subscription period.</p>
                        <Button
                          onClick={() => setActiveTab('subscribe')}
                          className="w-full py-3 text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <span className="mr-2">⚡</span>
                          Upgrade Subscription
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 rounded-xl p-4 mb-4 border border-amber-200 dark:border-amber-700">
                        <p className="font-bold text-amber-800 dark:text-amber-200 text-sm">No Active Subscription</p>
                        <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">You don't have an active subscription yet.</p>
                      </div>
                      <Button
                        onClick={() => setActiveTab('subscribe')}
                        className="py-3 px-6 text-sm font-bold bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <span className="mr-2">✨</span>
                        Create Subscription
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-800 dark:text-gray-200 mb-4 text-sm">Unable to load subscription details.</p>
                    <Button
                      onClick={getSubscriptionDetails}
                      className="py-3 px-6 text-sm font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <span className="mr-2">🔄</span>
                      Retry Loading
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 mb-4">
                  <p className="text-gray-800 dark:text-gray-200 text-sm">Connect your wallet to view your subscription details.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {txMessage && (
        <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
          isProcessing
            ? "bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
            : txMessage.includes("Success")
              ? "bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
              : "bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-700"
        }`}>
          <div className="flex items-center">
            {isProcessing ? (
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            ) : txMessage.includes("Success") ? (
              <span className="mr-2">✅</span>
            ) : (
              <span className="mr-2">❌</span>
            )}
            {txMessage}
          </div>
        </div>
      )}

      <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">Smart Contract:</span>
        </p>
        <a
          href={`https://basescan.org/address/${LOTTERY_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-mono bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-blue-600 dark:text-blue-400"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {LOTTERY_CONTRACT_ADDRESS.slice(0, 8)}...{LOTTERY_CONTRACT_ADDRESS.slice(-6)}
        </a>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          View on BaseScan ↗
        </p>
      </div>
    </div>
  );
}

export default MegaPotModule; 