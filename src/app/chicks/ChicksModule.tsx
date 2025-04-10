"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useChicks } from "./useChicks";
import { 
  CHICKS_CONTRACT_ADDRESS, 
  DEFAULT_USDC_AMOUNT, 
  DEFAULT_DAYS_COUNT 
} from "./constants";

export interface ChicksModuleProps {
  className?: string;
  isFullscreen?: boolean;
  onBack?: () => void;
}

export function ChicksModule({ className = "", isFullscreen = false, onBack }: ChicksModuleProps) {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell' | 'leverage' | 'position'>('buy');
  const [usdcAmount, setUsdcAmount] = useState(DEFAULT_USDC_AMOUNT);
  const [chicksAmount, setChicksAmount] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [dayCount, setDayCount] = useState(DEFAULT_DAYS_COUNT);
  
  const { 
    buyChicks, 
    sellChicks, 
    leverage,
    closePosition,
    isProcessing, 
    txMessage, 
    isConnected,
    loanDetails,
    isLoadingLoan,
    getLoanDetails,
    chicksPrice
  } = useChicks();

  // Format timestamp to readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  // Update estimated chicks amount when USDC amount changes
  useEffect(() => {
    if (chicksPrice && chicksPrice !== "0" && usdcAmount) {
      const usdcValue = parseFloat(usdcAmount);
      const price = parseFloat(chicksPrice);
      if (!isNaN(usdcValue) && !isNaN(price) && price > 0) {
        const estimated = usdcValue / price;
        setChicksAmount(estimated.toFixed(6));
      }
    }
  }, [usdcAmount, chicksPrice]);

  return (
    <div className={`p-3 bg-[#228B22]/10 dark:bg-[#006400]/20 rounded-lg w-full ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto rounded-none bg-white dark:bg-gray-900' : 'max-w-[300px] mx-auto'} text-sm ${className}`}>
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
          <h2 className="text-lg font-bold text-center pt-1.5 pb-1 text-black dark:text-white">Chicks Finance</h2>
        </div>
      )}
      
      {!isFullscreen && (
        <h2 className="text-lg font-bold mb-2">Chicks Finance</h2>
      )}
      
      <div className="flex justify-between bg-[#006400]/10 dark:bg-[#228B22]/10 rounded-lg p-1 mb-3">
        <button 
          className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'buy' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('buy')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'buy' ? 'text-[#228B22] dark:text-[#90EE90]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Buy
        </button>
        
        <button 
          className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'sell' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('sell')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'sell' ? 'text-[#228B22] dark:text-[#90EE90]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h12" />
          </svg>
          Sell
        </button>
        
        <button 
          className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'leverage' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('leverage')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'leverage' ? 'text-[#228B22] dark:text-[#90EE90]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Leverage
        </button>
        
        <button 
          className={`py-2.5 flex-1 text-xs rounded-md transition-colors flex flex-col items-center ${activeTab === 'position' ? 'font-bold bg-white dark:bg-gray-700 shadow-sm text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700/50'}`}
          onClick={() => setActiveTab('position')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mb-1 ${activeTab === 'position' ? 'text-[#228B22] dark:text-[#90EE90]' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Position
        </button>
      </div>

      {/* Display transaction status */}
      {isProcessing ? (
        <div className="text-center py-3 mb-2">
          <div className="animate-spin h-6 w-6 border-2 border-[#228B22] dark:border-[#90EE90] border-t-transparent rounded-full mx-auto mb-1"></div>
          <p className="text-gray-800 dark:text-gray-200 text-xs">Processing...</p>
        </div>
      ) : txMessage ? (
        <div className={`p-2 rounded mb-2 text-xs ${txMessage.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"}`}>
          {txMessage}
        </div>
      ) : null}
      
      {activeTab === 'buy' && (
        <>
          <div className="mb-3 p-2 bg-[#228B22]/5 rounded text-xs">
            <h3 className="font-medium mb-1 text-black dark:text-white">How it works:</h3>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
              <li>Buy Chicks tokens with USDC</li>
              <li>Current price: {chicksPrice ? `${parseFloat(chicksPrice).toFixed(6)} USDC` : "Loading..."}</li>
              <li>Hold Chicks to earn passive income from AAVE</li>
              <li>Use leverage to increase your position</li>
            </ul>
          </div>
          
          <div className="mb-2">
            <Label htmlFor="usdc-amount" className="font-medium mb-1 block text-xs text-black dark:text-white">USDC Amount</Label>
            <Input 
              id="usdc-amount" 
              type="number" 
              placeholder="Enter USDC amount" 
              style={{color: 'black', backgroundColor: 'white'}}
              className="border-2 border-[#228B22]/50 focus:border-[#228B22] font-medium p-1.5 rounded w-full text-sm dark:text-black"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
              min="1"
              disabled={isProcessing}
            />
          </div>
          
          <div className="text-right mb-2">
            <p className="text-xs text-gray-800 dark:text-gray-200">Estimated Chicks: {chicksAmount}</p>
          </div>
          
          <Button 
            onClick={() => buyChicks(usdcAmount)}
            disabled={isProcessing || !isConnected}
            className="py-2 text-sm w-full bg-[#228B22] hover:bg-[#228B22]/80"
          >
            Buy Chicks
          </Button>
        </>
      )}
      
      {activeTab === 'sell' && (
        <>
          <div className="mb-3 p-2 bg-[#228B22]/5 rounded text-xs">
            <h3 className="font-medium mb-1 text-black dark:text-white">Sell Chicks:</h3>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
              <li>Sell your Chicks tokens for USDC</li>
              <li>Current price: {chicksPrice ? `${parseFloat(chicksPrice).toFixed(6)} USDC` : "Loading..."}</li>
              <li>Note: A sell fee may apply</li>
            </ul>
          </div>
          
          <div className="mb-2">
            <Label htmlFor="chicks-amount" className="font-medium mb-1 block text-xs text-black dark:text-white">Chicks Amount</Label>
            <Input 
              id="chicks-amount" 
              type="number" 
              placeholder="Enter Chicks amount" 
              style={{color: 'black', backgroundColor: 'white'}}
              className="border-2 border-[#228B22]/50 focus:border-[#228B22] font-medium p-1.5 rounded w-full text-sm dark:text-black"
              value={chicksAmount}
              onChange={(e) => setChicksAmount(e.target.value)}
              min="0.000001"
              disabled={isProcessing}
            />
          </div>
          
          <div className="text-right mb-2">
            <p className="text-xs text-gray-800 dark:text-gray-200">
              Estimated USDC: {chicksAmount && chicksPrice ? 
                (parseFloat(chicksAmount) * parseFloat(chicksPrice)).toFixed(6) : "0"}
            </p>
          </div>
          
          <Button 
            onClick={() => sellChicks(chicksAmount)}
            disabled={isProcessing || !isConnected || !chicksAmount || parseFloat(chicksAmount) <= 0}
            className="py-2 text-sm w-full bg-[#228B22] hover:bg-[#228B22]/80"
          >
            Sell Chicks
          </Button>
        </>
      )}
      
      {activeTab === 'leverage' && (
        <>
          <div className="mb-3 p-2 bg-[#228B22]/5 rounded text-xs">
            <h3 className="font-medium mb-1 text-black dark:text-white">Leverage Position:</h3>
            <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
              <li>Create a leveraged position to multiply your exposure</li>
              <li>Provide USDC as collateral</li>
              <li>Position expires after set period</li>
              <li>Remember to close before expiry to avoid liquidation</li>
            </ul>
          </div>
          
          <div className="mb-2">
            <Label htmlFor="leverage-amount" className="font-medium mb-1 block text-xs text-black dark:text-white">USDC Collateral</Label>
            <Input 
              id="leverage-amount" 
              type="number" 
              placeholder="Enter USDC amount for collateral" 
              style={{color: 'black', backgroundColor: 'white'}}
              className="border-2 border-[#228B22]/50 focus:border-[#228B22] font-medium p-1.5 rounded w-full text-sm dark:text-black"
              value={usdcAmount}
              onChange={(e) => setUsdcAmount(e.target.value)}
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
              className="border-2 border-[#228B22]/50 focus:border-[#228B22] font-medium p-1.5 rounded w-full text-sm dark:text-black"
              value={dayCount}
              onChange={(e) => setDayCount(e.target.value)}
              min="1"
              max="365"
              disabled={isProcessing}
            />
          </div>
          
          <Button 
            onClick={() => leverage(usdcAmount, dayCount)}
            disabled={isProcessing || !isConnected || !usdcAmount || parseFloat(usdcAmount) <= 0}
            className="py-2 text-sm w-full bg-[#228B22] hover:bg-[#228B22]/80"
          >
            Create Leverage Position
          </Button>
        </>
      )}
      
      {activeTab === 'position' && (
        <div className="p-2 bg-[#228B22]/5 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-900 dark:text-white text-xs">My Position Details</h3>
            <button 
              onClick={getLoanDetails}
              disabled={isLoadingLoan}
              className="text-xs text-[#228B22] dark:text-[#90EE90] hover:text-[#006400] dark:hover:text-[#ADFF2F] flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          
          {isConnected ? (
            <>
              {isLoadingLoan ? (
                <div className="text-center py-3">
                  <div className="animate-spin h-6 w-6 border-2 border-[#228B22] dark:border-[#90EE90] border-t-transparent rounded-full mx-auto mb-1"></div>
                  <p className="text-gray-800 dark:text-gray-200 text-xs">Loading...</p>
                </div>
              ) : loanDetails && loanDetails.isActive ? (
                <div className="space-y-2">
                  <div className="bg-white dark:bg-gray-800 p-2 rounded shadow-sm">
                    <div className="flex justify-between items-center border-b pb-1 mb-2">
                      <span className="font-bold text-black dark:text-white text-xs">Active Position</span>
                      <span className="bg-green-100 text-green-800 text-[10px] px-1.5 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Collateral (USDC)</p>
                        <p className="font-bold text-sm text-black dark:text-white">{loanDetails.collateral.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Borrowed (USDC)</p>
                        <p className="font-bold text-sm text-black dark:text-white">{loanDetails.borrowed.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">End Date</p>
                        <p className="font-bold text-sm text-black dark:text-white">{formatDate(loanDetails.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-300">Days Remaining</p>
                        <p className="font-bold text-sm text-black dark:text-white">
                          {Math.max(0, Math.floor((loanDetails.endDate - Date.now()/1000) / 86400))}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <Label htmlFor="repay-amount" className="font-medium mb-1 block text-xs text-black dark:text-white">Repay Amount (USDC)</Label>
                      <Input 
                        id="repay-amount" 
                        type="number" 
                        placeholder="Enter USDC amount to repay" 
                        style={{color: 'black', backgroundColor: 'white'}}
                        className="border-2 border-[#228B22]/50 focus:border-[#228B22] font-medium p-1.5 rounded w-full text-sm dark:text-black mb-2"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        min="1"
                        disabled={isProcessing}
                      />
                      
                      <Button 
                        onClick={() => closePosition(repayAmount)}
                        disabled={isProcessing || !repayAmount || parseFloat(repayAmount) <= 0}
                        className="py-1.5 text-xs w-full bg-[#228B22] hover:bg-[#228B22]/80"
                      >
                        Close Position
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-center">
                  <p className="text-gray-700 dark:text-gray-300 text-xs">No active position found.</p>
                  <button 
                    onClick={() => setActiveTab('leverage')}
                    className="mt-2 text-xs text-[#228B22] dark:text-[#90EE90] hover:text-[#006400] dark:hover:text-[#ADFF2F] underline"
                  >
                    Create a new position
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-center">
              <p className="text-gray-700 dark:text-gray-300 text-xs">Please connect your wallet to view position details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 