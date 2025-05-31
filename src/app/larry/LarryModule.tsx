'use client';

import { useState, useEffect } from 'react';
import { formatEther, parseEther } from 'viem';
import { useAccount } from 'wagmi';
import { useLarry } from './useLarry';
import { LEVERAGE_TABS, LeverageTabId, formatLarry, formatEth, formatPrice } from './constants';
import { Button } from '~/components/ui/Button';

interface LarryModuleProps {
  className?: string;
  isFullscreen?: boolean;
  onBack?: () => void;
}

export default function LarryModule({ className = '', isFullscreen = false, onBack }: LarryModuleProps) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<LeverageTabId>('buy');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('7');
  const [buyEstimate, setBuyEstimate] = useState('0');
  const [sellEstimate, setSellEstimate] = useState('0');
  
  const {
    status,
    error,
    isLoading,
    stats,
    loanData,
    totalBorrowed,
    totalCollateral,
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
    calculateBuyAmount,
    calculateSellReturn,
  } = useLarry();

  // Calculate estimates
  useEffect(() => {
    const calculateEstimates = async () => {
      if (amount && !isNaN(parseFloat(amount))) {
        if (activeTab === 'buy') {
          const estimate = await calculateBuyAmount(amount);
          setBuyEstimate(formatLarry(estimate));
        } else if (activeTab === 'sell') {
          const estimate = await calculateSellReturn(amount);
          setSellEstimate(formatEther(estimate));
        }
      } else {
        setBuyEstimate('0');
        setSellEstimate('0');
      }
    };
    
    calculateEstimates();
  }, [amount, activeTab, calculateBuyAmount, calculateSellReturn]);

  const handleAction = async () => {
    if (!amount || isLoading) return;
    
    switch (activeTab) {
      case 'buy':
        await buyLarry(amount);
        break;
      case 'sell':
        await sellLarry(amount);
        break;
      case 'leverage':
        await openLeverage(amount, parseInt(days));
        break;
      case 'borrow':
        if (loanData && !loanData.isExpired) {
          await borrowMore(amount);
        } else {
          await borrow(amount, parseInt(days));
        }
        break;
    }
    
    if (!error) {
      setAmount('');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'buy':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ETH Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.0"
                step="0.001"
              />
            </div>
            
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">You will receive:</p>
                <p className="text-xl font-bold text-white">{buyEstimate} LARRY</p>
                <p className="text-xs text-gray-500 mt-1">
                  Fee: {((10000 - stats.buyFee) / 100).toFixed(2)}%
                </p>
              </div>
            )}
            
            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Buy LARRY'}
            </Button>
          </div>
        );
        
      case 'sell':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LARRY Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.0"
                step="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Balance: {formatLarry(stats.userBalance)} LARRY
              </p>
            </div>
            
            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-400">You will receive:</p>
                <p className="text-xl font-bold text-white">{sellEstimate} ETH</p>
                <p className="text-xs text-gray-500 mt-1">
                  Fee: {((10000 - stats.sellFee) / 100).toFixed(2)}%
                </p>
              </div>
            )}
            
            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Sell LARRY'}
            </Button>
          </div>
        );
        
      case 'leverage':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ETH Amount
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="0.0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Days to Borrow
              </label>
              <input
                type="number"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="7"
                min="1"
                max="365"
              />
            </div>
            
            <div className="bg-gray-800 p-4 rounded-lg text-sm">
              <p className="text-gray-400">Leverage Details:</p>
              <ul className="mt-2 space-y-1 text-gray-300">
                <li>• 99% of ETH value as leverage</li>
                <li>• 1% overcollateralization required</li>
                <li>• Interest: ~3.9% APR + 0.1% base</li>
                <li>• Leverage fee: {(stats.leverageFee / 100).toFixed(2)}%</li>
              </ul>
            </div>
            
            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full"
            >
              {isLoading ? 'Processing...' : 'Open Leverage Position'}
            </Button>
          </div>
        );
        
      case 'borrow':
        return (
          <div className="space-y-4">
            {loanData && !loanData.isExpired ? (
              <>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-2">Current Loan</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      Borrowed: <span className="text-white font-medium">{formatEth(loanData.borrowed)} ETH</span>
                    </p>
                    <p className="text-gray-300">
                      Collateral: <span className="text-white font-medium">{formatLarry(loanData.collateral)} LARRY</span>
                    </p>
                    <p className="text-gray-300">
                      Expires: <span className="text-white font-medium">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Borrow More ETH
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="0.0"
                    step="0.01"
                  />
                </div>
                
                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Borrow More'}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    ETH Amount to Borrow
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="0.0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Days to Borrow
                  </label>
                  <input
                    type="number"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="7"
                    min="1"
                    max="365"
                  />
                </div>
                
                <div className="bg-gray-800 p-4 rounded-lg text-sm">
                  <p className="text-gray-400">Borrow Details:</p>
                  <ul className="mt-2 space-y-1 text-gray-300">
                    <li>• Collateral required: 100% in LARRY</li>
                    <li>• Borrow up to 99% of collateral value</li>
                    <li>• Interest: ~3.9% APR + 0.1% base</li>
                  </ul>
                </div>
                
                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Borrow ETH'}
                </Button>
              </>
            )}
          </div>
        );
        
      case 'positions':
        return (
          <div className="space-y-4">
            {loanData && !loanData.isExpired ? (
              <>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">Active Position</h3>
                  <div className="space-y-2 text-sm">
                    <p className="text-gray-300">
                      Borrowed: <span className="text-white font-medium">{formatEth(loanData.borrowed)} ETH</span>
                    </p>
                    <p className="text-gray-300">
                      Collateral: <span className="text-white font-medium">{formatLarry(loanData.collateral)} LARRY</span>
                    </p>
                    <p className="text-gray-300">
                      Expires: <span className="text-white font-medium">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </span>
                    </p>
                    <p className="text-gray-300">
                      Health: <span className="text-green-400 font-medium">
                        {((Number(loanData.collateral) / Number(loanData.borrowed)) * 100).toFixed(2)}%
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => repay(formatEther(loanData.borrowed))}
                    disabled={isLoading}
                    className="text-sm bg-gray-600 hover:bg-gray-700"
                  >
                    Repay Full
                  </Button>
                  
                  <Button
                    onClick={flashClosePosition}
                    disabled={isLoading}
                    className="text-sm bg-gray-600 hover:bg-gray-700"
                  >
                    Flash Close
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const daysToExtend = prompt('Days to extend:');
                      if (daysToExtend) extendLoan(parseInt(daysToExtend));
                    }}
                    disabled={isLoading}
                    className="text-sm bg-gray-600 hover:bg-gray-700"
                  >
                    Extend Loan
                  </Button>
                  
                  <Button
                    onClick={() => {
                      const collateralAmount = prompt('LARRY amount to remove:');
                      if (collateralAmount) removeCollateral(collateralAmount);
                    }}
                    disabled={isLoading}
                    className="text-sm bg-gray-600 hover:bg-gray-700"
                  >
                    Remove Collateral
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No active positions</p>
                <p className="text-sm text-gray-500 mt-2">
                  Open a leverage position or borrow to get started
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`bg-gray-900 rounded-xl p-4 ${isFullscreen ? 'min-h-screen' : ''} ${className}`}>
      {isFullscreen && onBack && (
        <button
          onClick={onBack}
          className="mb-4 text-gray-400 hover:text-white transition-colors"
        >
          ← Back
        </button>
      )}
      
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Larry Talbot Ecosystem</h2>
        <p className="text-gray-400 text-sm">Buy, sell, leverage, and borrow with LARRY</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Price (ETH)</p>
          <p className="text-lg font-semibold text-white font-mono">
            {formatPrice(stats.price)} Ξ
          </p>
          {stats.price > 0n && stats.price < parseEther('0.01') && (
            <p className="text-[10px] text-gray-500 mt-0.5">
              = {(Number(stats.price) / 10**18).toFixed(12).replace(/\.?0+$/, '')} ETH
            </p>
          )}
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Your Balance</p>
          <p className="text-lg font-semibold text-white">
            {formatLarry(stats.userBalance)}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Total Supply</p>
          <p className="text-lg font-semibold text-white">
            {formatLarry(stats.totalSupply)}
          </p>
        </div>
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400">Backing</p>
          <p className="text-lg font-semibold text-white">
            {formatEth(stats.backing)} ETH
          </p>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
        {LEVERAGE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* Tab Content */}
      <div className="mb-4">
        {renderTabContent()}
      </div>
      
      {/* Status Messages */}
      {status && (
        <div className="bg-blue-600 bg-opacity-20 border border-blue-600 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-400">{status}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-600 bg-opacity-20 border border-red-600 rounded-lg p-3 mb-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
      
      {/* Protocol Stats */}
      <div className="mt-6 pt-6 border-t border-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Protocol Stats</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Total Borrowed</p>
            <p className="text-white font-medium">{formatEth(totalBorrowed)} ETH</p>
          </div>
          <div>
            <p className="text-gray-500">Total Collateral</p>
            <p className="text-white font-medium">{formatLarry(totalCollateral)} LARRY</p>
          </div>
        </div>
      </div>
    </div>
  );
}