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
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3 text-sm">Buy LARRY</h3>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">Amount (ETH)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                placeholder="0.0"
                step="0.001"
              />
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-700 rounded p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">You receive</p>
                <p className="text-xl font-bold text-white">{buyEstimate} LARRY</p>
                <p className="text-xs text-gray-400 mt-2">Fee: {((10000 - stats.buyFee) / 100).toFixed(2)}%</p>
              </div>
            )}

            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Buy LARRY'}
            </Button>
          </div>
        );
        
      case 'sell':
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3 text-sm">Sell LARRY</h3>

            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-2">LARRY Amount to Sell</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                placeholder="0.0"
                step="1"
              />
              <p className="text-xs text-gray-400 mt-1">
                Available: {formatLarry(stats.userBalance)} LARRY
              </p>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gray-700 rounded p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1">You receive</p>
                <p className="text-xl font-bold text-white">{sellEstimate} ETH</p>
                <p className="text-xs text-gray-400 mt-2">
                  Fee: {((10000 - stats.sellFee) / 100).toFixed(2)}%
                </p>
              </div>
            )}

            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : `Sell ${amount || '0'} LARRY`}
            </Button>
          </div>
        );
        
      case 'leverage':
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-bold text-white mb-3 text-sm">Open Leverage</h3>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs text-gray-400 mb-2">ETH Collateral</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                  placeholder="0.0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Days</label>
                <input
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                  placeholder="7"
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="bg-gray-700 rounded p-3 mb-3">
              <p className="text-xs text-gray-400 mb-2">Details:</p>
              <ul className="space-y-1 text-xs text-gray-300">
                <li>• 99% leverage available</li>
                <li>• 1% overcollateralization required</li>
                <li>• Interest: ~3.9% APR + 0.1% base</li>
                <li>• Fee: {(stats.leverageFee / 100).toFixed(2)}%</li>
              </ul>
            </div>

            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded font-medium disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Open Leverage'}
            </Button>
          </div>
        );
        
      case 'borrow':
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            {loanData && !loanData.isExpired ? (
              <>
                <div className="bg-gray-700 rounded p-3 mb-3">
                  <h3 className="text-sm font-bold text-white mb-2">Current Loan</h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <p className="text-gray-400">Borrowed</p>
                      <p className="font-bold text-white">{formatEth(loanData.borrowed)} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Collateral</p>
                      <p className="font-bold text-white">{formatLarry(loanData.collateral)} LARRY</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="font-bold text-white">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs text-gray-400 mb-2">Borrow More</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                    placeholder="0.0"
                    step="0.01"
                  />
                </div>

                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Borrow More'}
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-white mb-3 text-sm">New Borrow</h3>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2">ETH to Borrow</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                      placeholder="0.0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-2">Days</label>
                    <input
                      type="number"
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-purple-500"
                      placeholder="7"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="bg-gray-700 rounded p-3 mb-3">
                  <p className="text-xs text-gray-400 mb-2">Requirements:</p>
                  <ul className="space-y-1 text-xs text-gray-300">
                    <li>• 100% collateral in LARRY</li>
                    <li>• Borrow up to 99% of value</li>
                    <li>• Interest: ~3.9% APR + 0.1% base</li>
                  </ul>
                </div>

                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-medium disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Borrow ${amount || '0'} ETH`}
                </Button>
              </>
            )}
          </div>
        );
        
      case 'positions':
        return (
          <div className="bg-gray-800 rounded-lg p-4">
            {loanData && !loanData.isExpired ? (
              <>
                <h3 className="font-bold text-white mb-3 text-sm">Active Position</h3>

                <div className="bg-gray-700 rounded p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                    <div>
                      <p className="text-gray-400">Borrowed</p>
                      <p className="font-bold text-white">{formatEth(loanData.borrowed)} ETH</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Collateral</p>
                      <p className="font-bold text-white">{formatLarry(loanData.collateral)} LARRY</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-gray-400">Expires</p>
                      <p className="font-bold text-white">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Health</p>
                      <p className="font-bold text-green-400">
                        {((Number(loanData.collateral) / Number(loanData.borrowed)) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => repay(formatEther(loanData.borrowed))}
                    disabled={isLoading}
                    className="py-2 text-xs font-medium bg-green-600 hover:bg-green-700 text-white rounded"
                  >
                    Repay Full
                  </Button>

                  <Button
                    onClick={flashClosePosition}
                    disabled={isLoading}
                    className="py-2 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                  >
                    Flash Close
                  </Button>

                  <Button
                    onClick={() => {
                      const daysToExtend = prompt('Days to extend:');
                      if (daysToExtend) extendLoan(parseInt(daysToExtend));
                    }}
                    disabled={isLoading}
                    className="py-2 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded"
                  >
                    Extend Loan
                  </Button>

                  <Button
                    onClick={() => {
                      const collateralAmount = prompt('LARRY amount to remove:');
                      if (collateralAmount) removeCollateral(collateralAmount);
                    }}
                    disabled={isLoading}
                    className="py-2 text-xs font-medium bg-purple-600 hover:bg-purple-700 text-white rounded"
                  >
                    Remove Collateral
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <div className="bg-gray-700 rounded p-4 mb-3">
                  <p className="text-gray-300 text-sm font-medium mb-1">No Active Positions</p>
                  <p className="text-xs text-gray-400">
                    Open leverage or borrow to get started
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => setActiveTab('leverage')}
                    className="py-2 text-xs font-medium bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                  >
                    Leverage
                  </Button>
                  <Button
                    onClick={() => setActiveTab('borrow')}
                    className="py-2 text-xs font-medium bg-cyan-600 hover:bg-cyan-700 text-white rounded"
                  >
                    Borrow
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`bg-gray-900 ${isFullscreen ? 'min-h-screen' : 'rounded-xl'} p-4 ${className}`}>
      {isFullscreen && onBack && (
        <button
          onClick={onBack}
          className="mb-3 text-purple-400 hover:text-purple-300 text-sm font-medium"
        >
          ← Back
        </button>
      )}

      {/* Simple Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🐺</span>
          <h2 className="text-xl font-bold text-white">Larry Talbot</h2>
        </div>
        <p className="text-purple-400 text-sm">DeFi Trading</p>
      </div>
      
      {/* Simple Stats */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Price</p>
          <p className="text-lg font-bold text-white">
            {formatPrice(stats.price)} Ξ
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Balance</p>
          <p className="text-lg font-bold text-white truncate">
            {formatLarry(stats.userBalance)}
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Supply</p>
          <p className="text-lg font-bold text-white truncate">
            {formatLarry(stats.totalSupply)}
          </p>
        </div>

        <div className="bg-gray-800 p-3 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Backing</p>
          <p className="text-lg font-bold text-white">
            {formatEth(stats.backing)} ETH
          </p>
        </div>
      </div>
      
      {/* Simple Tabs */}
      <div className="mb-4">
        <div className="bg-gray-800 rounded-lg p-1">
          <div className="grid grid-cols-5 gap-1">
            {LEVERAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 rounded text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-4">
        {renderTabContent()}
      </div>
      
      {/* Status Messages */}
      {status && (
        <div className="bg-blue-900 border border-blue-700 rounded p-3 mb-3">
          <p className="text-xs text-blue-300">{status}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900 border border-red-700 rounded p-3 mb-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Protocol Stats */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <h3 className="text-sm font-bold text-gray-300 mb-3">Protocol Stats</h3>
        <div className="bg-gray-800 rounded p-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-gray-400 mb-1">Total Borrowed</p>
              <p className="font-bold text-white">{formatEth(totalBorrowed)} ETH</p>
            </div>
            <div>
              <p className="text-gray-400 mb-1">Total Collateral</p>
              <p className="font-bold text-white">{formatLarry(totalCollateral)} LARRY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}