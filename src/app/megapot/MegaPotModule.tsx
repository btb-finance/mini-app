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
    <div className={`bg-gray-900 ${isFullscreen ? 'min-h-screen' : 'rounded-xl'} p-4 ${className}`}>
      {isFullscreen && onBack && (
        <button onClick={onBack} className="mb-3 text-yellow-400 hover:text-yellow-300 text-sm font-medium">
          ← Back
        </button>
      )}

      {/* Simple Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎯</span>
          <h2 className="text-xl font-bold text-white">Mega Pot</h2>
        </div>
        <p className="text-yellow-400 text-sm">Weekly Lottery - 1 USDC per ticket</p>
      </div>
      
      <div className="mb-4">
        <div className="bg-gray-800 rounded-lg p-1 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
          <div className="grid grid-cols-3 gap-1">
            <button
              className={`py-2 px-2 text-xs rounded ${
                activeTab === 'buy'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('buy')}
            >
              Buy
            </button>
            <button
              className={`py-2 px-2 text-xs rounded ${
                activeTab === 'subscribe'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('subscribe')}
            >
              Subscribe
            </button>
            <button
              className={`py-2 px-2 text-xs rounded ${
                activeTab === 'history'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              onClick={() => setActiveTab('history')}
            >
              History
            </button>
          </div>
        </div>
        
        {activeTab === 'buy' && (
          <div className="bg-gray-800 rounded-lg p-4 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
            <h3 className="font-bold mb-3 text-white text-sm">Buy Tickets</h3>

            <div className="mb-3">
              <Label htmlFor="ticket-amount" className="mb-2 block text-xs text-gray-400">
                Number of Tickets
              </Label>
              <Input
                id="ticket-amount"
                type="number"
                placeholder="1-1000"
                style={{color: 'black', backgroundColor: 'white'}}
                className="border border-gray-600 p-2 rounded w-full text-sm"
                value={ticketAmount}
                onChange={(e) => setTicketAmount(e.target.value)}
                min="1"
                max="1000"
                disabled={isProcessing}
              />
            </div>

            <div className="bg-gray-700 rounded p-3 mb-3">
              <p className="text-xs text-gray-400 mb-1">Total Cost</p>
              <p className="text-xl font-bold text-white">{parseFloat(ticketAmount || "0")} USDC</p>
            </div>

            <Button
              onClick={() => purchaseTickets(ticketAmount)}
              disabled={isProcessing || !isConnected}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : `Buy ${ticketAmount || '0'} Ticket${ticketAmount !== '1' ? 's' : ''}`}
            </Button>
          </div>
        )}
        
        {activeTab === 'subscribe' && (
          <div className="bg-gray-800 rounded-lg p-4 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
            <h3 className="font-bold mb-3 text-white text-sm">Subscription</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <Label htmlFor="tickets-per-day" className="mb-2 block text-xs text-gray-400">
                  Tickets/Day
                </Label>
                <Input
                  id="tickets-per-day"
                  type="number"
                  placeholder="1-100"
                  style={{color: 'black', backgroundColor: 'white'}}
                  className="border border-gray-600 p-2 rounded w-full text-sm"
                  value={ticketsPerDay}
                  onChange={(e) => setTicketsPerDay(e.target.value)}
                  min="1"
                  max="100"
                  disabled={isProcessing}
                />
              </div>

              <div>
                <Label htmlFor="day-count" className="mb-2 block text-xs text-gray-400">
                  Days
                </Label>
                <Input
                  id="day-count"
                  type="number"
                  placeholder="1-365"
                  style={{color: 'black', backgroundColor: 'white'}}
                  className="border border-gray-600 p-2 rounded w-full text-sm"
                  value={dayCount}
                  onChange={(e) => setDayCount(e.target.value)}
                  min="1"
                  max="365"
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3 mb-3">
              <p className="text-xs text-gray-400 mb-1">Total Cost</p>
              <p className="text-xl font-bold text-white">{parseInt(ticketsPerDay || "0") * parseInt(dayCount || "0")} USDC</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => createSubscription(ticketsPerDay, dayCount)}
                disabled={isProcessing || !isConnected}
                className="py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50"
              >
                {isProcessing ? 'Processing...' : 'Create'}
              </Button>

              <Button
                onClick={cancelSubscription}
                disabled={isProcessing || !isConnected || !subscriptionDetails?.isActive}
                className="py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg p-4 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white text-sm">My Subscription</h3>
              <button
                onClick={getSubscriptionDetails}
                disabled={isLoadingSubscription}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
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
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-xs">Loading...</p>
                  </div>
                ) : subscriptionDetails ? (
                  subscriptionDetails.isActive ? (
                    <div className="space-y-3">
                      <div className="bg-gray-700 rounded p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-white text-xs">Active Subscription</span>
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-gray-400 mb-1">Tickets/Day</p>
                            <p className="font-bold text-white">{subscriptionDetails.ticketsPerDay}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 mb-1">Days Left</p>
                            <p className="font-bold text-white">{subscriptionDetails.daysRemaining}</p>
                          </div>
                        </div>

                        <Button
                          onClick={cancelSubscription}
                          className="mt-3 w-full py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded disabled:opacity-50"
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                      </div>

                      <Button
                        onClick={() => setActiveTab('subscribe')}
                        className="w-full py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded"
                      >
                        Upgrade
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="bg-gray-700 rounded p-3 mb-3">
                        <p className="font-bold text-white text-xs">No Active Subscription</p>
                      </div>
                      <Button
                        onClick={() => setActiveTab('subscribe')}
                        className="py-2 px-4 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded"
                      >
                        Create Subscription
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-400 mb-3 text-xs">Unable to load details</p>
                    <Button
                      onClick={getSubscriptionDetails}
                      className="py-2 px-4 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <div className="bg-gray-700 rounded p-3">
                  <p className="text-gray-400 text-xs">Connect wallet to view details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {txMessage && (
        <div className={`mt-3 p-2 rounded text-xs ${
          isProcessing
            ? "bg-blue-900 text-blue-300"
            : txMessage.includes("Success")
              ? "bg-green-900 text-green-300"
              : "bg-red-900 text-red-300"
        }`}>
          {txMessage}
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