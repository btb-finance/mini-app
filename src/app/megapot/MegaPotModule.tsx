"use client";

import { useState } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useMegaPot } from "./useMegaPot";
import LOTTERY_CONTRACT_ADDRESS, { 
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
    <div className={`p-3 bg-[#A52A2A]/10 dark:bg-[#8B0000]/20 rounded-lg w-full ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto rounded-none bg-white dark:bg-gray-900' : 'max-w-[300px] mx-auto'} text-sm ${className}`}>
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
        <h2 className="text-lg font-bold mb-2">Mega Pot</h2>
      )}
      
      <p className="mb-2 text-sm text-center">{isFullscreen ? "Enter the weekly prize draw for 1 USDC per ticket" : "Buy tickets to enter the weekly prize draw. 1 USDC per ticket."}</p>
      
      <div className="mb-3">
        <div className="flex justify-between bg-gray-100 dark:bg-gray-800 rounded-lg p-1.5 mx-auto" style={{maxWidth: isFullscreen ? '95%' : '100%'}}>
          <button 
            className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'buy' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
            onClick={() => setActiveTab('buy')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'buy' ? 'text-[#8B0000] dark:text-[#ff6b6b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            Buy Tickets
          </button>
          <button 
            className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'subscribe' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
            onClick={() => setActiveTab('subscribe')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'subscribe' ? 'text-[#8B0000] dark:text-[#ff6b6b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Subscribe
          </button>
          <button 
            className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'history' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
            onClick={() => setActiveTab('history')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'history' ? 'text-[#8B0000] dark:text-[#ff6b6b]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            My Tickets
          </button>
        </div>
        
        {activeTab === 'buy' && (
          <>
            <div className="mb-3 p-2 bg-[#8B0000]/5 rounded text-xs">
              <h3 className="font-medium mb-1 text-black dark:text-white">How it works:</h3>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
                <li>Each ticket costs 1 USDC</li>
                <li>Weekly drawings with multiple winners</li>
                <li>More tickets = higher chances</li>
                <li>Receive cashback on purchases</li>
              </ul>
            </div>
            
            <div className="mb-2">
              <Label htmlFor="ticket-amount" className="font-medium mb-1 block text-xs text-black dark:text-white">Number of Tickets</Label>
              <Input 
                id="ticket-amount" 
                type="number" 
                placeholder="Enter number of tickets" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#A52A2A]/50 focus:border-[#A52A2A] font-medium p-1.5 rounded w-full text-sm dark:text-black"
                value={ticketAmount}
                onChange={(e) => setTicketAmount(e.target.value)}
                min="1"
                disabled={isProcessing}
              />
            </div>
            
            <div className="text-right mb-2">
              <p className="text-xs text-gray-800 dark:text-gray-200">Total Cost: {parseFloat(ticketAmount || "0")} USDC</p>
            </div>
            
            <Button 
              onClick={() => purchaseTickets(ticketAmount)}
              disabled={isProcessing || !isConnected}
              className="py-2 text-sm"
            >
              {isProcessing ? "Processing..." : "Buy Tickets"}
            </Button>
          </>
        )}
        
        {activeTab === 'subscribe' && (
          <>
            <div className="mb-3 p-2 bg-[#8B0000]/5 rounded text-xs">
              <h3 className="font-medium mb-1 text-black dark:text-white">Subscription Benefits:</h3>
              <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
                <li>Automatic daily entries</li>
                <li>Special cashback for subscribers</li>
                <li>Never miss a drawing</li>
                <li>Cancel anytime for a refund</li>
              </ul>
            </div>
            
            <div className="mb-2">
              <Label htmlFor="tickets-per-day" className="font-medium mb-1 block text-xs text-black dark:text-white">Tickets Per Day</Label>
              <Input 
                id="tickets-per-day" 
                type="number" 
                placeholder="Enter tickets per day" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#A52A2A]/50 focus:border-[#A52A2A] font-medium p-1.5 rounded w-full text-sm dark:text-black"
                value={ticketsPerDay}
                onChange={(e) => setTicketsPerDay(e.target.value)}
                min="1"
                disabled={isProcessing}
              />
            </div>
            
            <div className="mb-2">
              <Label htmlFor="day-count" className="font-medium mb-1 block text-xs text-black dark:text-white">Number of Days</Label>
              <Input 
                id="day-count" 
                type="number" 
                placeholder="Enter number of days" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#A52A2A]/50 focus:border-[#A52A2A] font-medium p-1.5 rounded w-full text-sm dark:text-black"
                value={dayCount}
                onChange={(e) => setDayCount(e.target.value)}
                min="1"
                disabled={isProcessing}
              />
            </div>
            
            <div className="text-right mb-2">
              <p className="text-xs text-gray-800 dark:text-gray-200">Total Cost: {parseInt(ticketsPerDay || "0") * parseInt(dayCount || "0")} USDC</p>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => createSubscription(ticketsPerDay, dayCount)}
                disabled={isProcessing || !isConnected}
                className="py-2 text-xs"
              >
                {isProcessing ? "Processing..." : "Create Subscription"}
              </Button>
              
              <Button 
                onClick={cancelSubscription}
                disabled={isProcessing || !isConnected}
                className="bg-red-600 hover:bg-red-700 py-2 text-xs"
              >
                Cancel Subscription
              </Button>
            </div>
          </>
        )}
        
        {activeTab === 'history' && (
          <div className="p-2 bg-[#8B0000]/5 rounded">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-gray-900 dark:text-white text-xs">My Subscription Details</h3>
              <button 
                onClick={getSubscriptionDetails}
                disabled={isLoadingSubscription}
                className="text-xs text-[#8B0000] dark:text-[#ff6b6b] hover:text-[#660000] dark:hover:text-[#ff8c8c] flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>
            
            {isConnected ? (
              <>
                {isProcessing ? (
                  <div className="text-center py-3">
                    <div className="animate-spin h-6 w-6 border-2 border-[#8B0000] dark:border-[#ff6b6b] border-t-transparent rounded-full mx-auto mb-1"></div>
                    <p className="text-gray-800 dark:text-gray-200 text-xs">Processing...</p>
                  </div>
                ) : txMessage ? (
                  <div className={`p-2 rounded mb-2 text-xs ${txMessage.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"}`}>
                    {txMessage}
                  </div>
                ) : null}
                
                {isLoadingSubscription ? (
                  <div className="text-center py-3">
                    <div className="animate-spin h-6 w-6 border-2 border-[#8B0000] dark:border-[#ff6b6b] border-t-transparent rounded-full mx-auto mb-1"></div>
                    <p className="text-gray-800 dark:text-gray-200 text-xs">Loading...</p>
                  </div>
                ) : subscriptionDetails ? (
                  subscriptionDetails.isActive ? (
                    <div className="space-y-2">
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                        <div className="flex justify-between items-center border-b pb-1 mb-2">
                          <span className="font-bold text-black dark:text-white text-xs">Active Subscription</span>
                          <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded">ACTIVE</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300">Tickets Per Day</p>
                            <p className="font-bold text-sm text-black dark:text-white">{subscriptionDetails.ticketsPerDay}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-300">Days Remaining</p>
                            <p className="font-bold text-sm text-black dark:text-white">{subscriptionDetails.daysRemaining}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 dark:text-gray-300">Total Remaining Tickets</p>
                          <p className="font-bold text-sm text-black dark:text-white">{subscriptionDetails.ticketsPerDay * subscriptionDetails.daysRemaining}</p>
                        </div>
                        
                        <Button 
                          onClick={cancelSubscription} 
                          className="mt-2 bg-red-600 hover:bg-red-700 w-full py-1.5 text-xs"
                          disabled={isProcessing}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                        <h4 className="font-medium mb-1 text-black dark:text-white text-xs">Want to upgrade?</h4>
                        <p className="text-xs mb-2 text-gray-700 dark:text-gray-300">You can increase your tickets per day or extend your subscription.</p>
                        <Button 
                          onClick={() => setActiveTab('subscribe')} 
                          className="w-full py-1.5 text-xs"
                        >
                          Upgrade Subscription
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-2">
                      <div className="bg-amber-100 text-amber-800 p-2 rounded mb-2">
                        <p className="font-medium text-xs">You don't have an active subscription.</p>
                      </div>
                      <Button 
                        onClick={() => setActiveTab('subscribe')} 
                        className="mt-1 py-1.5 text-xs"
                      >
                        Create Subscription
                      </Button>
                    </div>
                  )
                ) : (
                  <div className="text-center py-2">
                    <p className="text-gray-800 dark:text-gray-200 mb-2 text-xs">Unable to load subscription details.</p>
                    <Button 
                      onClick={getSubscriptionDetails} 
                      className="mt-1 py-1.5 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-gray-800 dark:text-gray-200 text-xs">Please connect your wallet to view your subscription details.</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {txMessage && (
        <div className={`mt-1.5 p-1.5 rounded text-xs ${
          isProcessing 
            ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300" 
            : txMessage.includes("Success") 
              ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" 
              : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
        }`}>
          {txMessage}
        </div>
      )}
      
      <div className="mt-2 text-center">
        <a 
          href={`https://basescan.org/address/${LOTTERY_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8B0000] dark:text-[#ff6b6b] hover:text-[#660000] dark:hover:text-[#ff8c8c] underline text-xs"
        >
          View Contract on BaseScan
        </a>
      </div>
    </div>
  );
}

export default MegaPotModule; 