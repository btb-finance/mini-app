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
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur opacity-10"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/50">
                  <span className="text-xl">💰</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Buy LARRY</h3>
                  <p className="text-sm text-green-300">Invest ETH to get LARRY tokens</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Amount to Invest
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-800/50 border-2 border-green-500/30 rounded-2xl text-white text-lg font-semibold focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all placeholder-gray-500"
                    placeholder="0.0"
                    step="0.001"
                  />
                  <span className="absolute right-5 top-1/2 -translate-y-1/2 text-green-400 font-bold">ETH</span>
                </div>
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-slate-800/80 backdrop-blur-sm rounded-2xl p-5 border border-green-500/30">
                    <p className="text-sm font-semibold text-green-300 mb-2">You will receive</p>
                    <p className="text-3xl font-bold text-white mb-3">{buyEstimate} <span className="text-green-400">LARRY</span></p>
                    <div className="flex items-center justify-between pt-3 border-t border-green-500/20">
                      <span className="text-xs text-gray-400">Trading Fee</span>
                      <span className="text-xs font-semibold text-green-400">{((10000 - stats.buyFee) / 100).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleAction}
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                className="w-full py-5 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-2xl shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>🚀</span>
                    <span>Buy LARRY Tokens</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        );
        
      case 'sell':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-purple-800/30 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <span className="text-xl mr-2">📈</span>
              Sell LARRY Tokens
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LARRY Amount to Sell
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400"
                placeholder="0.0"
                step="1"
              />
              <p className="text-xs text-gray-400 mt-2">
                Available: {formatLarry(stats.userBalance)} LARRY
              </p>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="bg-gradient-to-r from-blue-800/30 to-cyan-800/30 rounded-xl p-4 mb-4 border border-blue-700/50">
                <p className="text-sm text-blue-300 mb-1">You will receive:</p>
                <p className="text-2xl font-bold text-white">{sellEstimate} ETH</p>
                <p className="text-xs text-blue-400 mt-2">
                  Fee: {((10000 - stats.sellFee) / 100).toFixed(2)}%
                </p>
              </div>
            )}

            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">💰</span>
                  Sell {amount} LARRY
                </>
              )}
            </Button>
          </div>
        );
        
      case 'leverage':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-purple-800/30 shadow-lg">
            <h3 className="font-bold text-white mb-4 flex items-center">
              <span className="text-xl mr-2">⚡</span>
              Open Leverage Position
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  ETH Collateral
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-gray-400"
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
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all placeholder-gray-400"
                  placeholder="7"
                  min="1"
                  max="365"
                />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-800/30 to-orange-800/30 rounded-xl p-4 mb-4 border border-yellow-700/50">
              <p className="text-sm text-yellow-300 font-medium mb-2">Leverage Details:</p>
              <ul className="space-y-2 text-sm text-yellow-200">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2 mt-0.5">•</span>
                  99% of ETH value as leverage
                </li>
                <li className="flex items-start">
                  <span className="text-blue-400 mr-2 mt-0.5">•</span>
                  1% overcollateralization required
                </li>
                <li className="flex items-start">
                  <span className="text-purple-400 mr-2 mt-0.5">•</span>
                  Interest: ~3.9% APR + 0.1% base
                </li>
                <li className="flex items-start">
                  <span className="text-orange-400 mr-2 mt-0.5">•</span>
                  Leverage fee: {(stats.leverageFee / 100).toFixed(2)}%
                </li>
              </ul>
            </div>

            <Button
              onClick={handleAction}
              disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              className="w-full py-4 text-lg font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <span className="mr-2">⚡</span>
                  Open Leverage Position
                </>
              )}
            </Button>
          </div>
        );
        
      case 'borrow':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-purple-800/30 shadow-lg">
            {loanData && !loanData.isExpired ? (
              <>
                <div className="bg-gradient-to-r from-green-800/30 to-blue-800/30 rounded-xl p-4 mb-4 border border-green-700/50">
                  <h3 className="text-lg font-bold text-green-300 mb-3 flex items-center">
                    <span className="text-xl mr-2">🔄</span>
                    Current Loan Status
                  </h3>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Borrowed Amount</p>
                      <p className="text-xl font-bold text-white">{formatEth(loanData.borrowed)} ETH</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Collateral Locked</p>
                      <p className="text-xl font-bold text-white">{formatLarry(loanData.collateral)} LARRY</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Expires</p>
                      <p className="text-lg font-bold text-white">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Borrow Additional ETH
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-gray-400"
                    placeholder="0.0"
                    step="0.01"
                  />
                </div>

                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💰</span>
                      Borrow More ETH
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <h3 className="font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">🔄</span>
                  New Borrow Position
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      ETH to Borrow
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400"
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
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder-gray-400"
                      placeholder="7"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-cyan-800/30 to-blue-800/30 rounded-xl p-4 mb-4 border border-cyan-700/50">
                  <p className="text-sm text-cyan-300 font-medium mb-2">Borrow Requirements:</p>
                  <ul className="space-y-2 text-sm text-cyan-200">
                    <li className="flex items-start">
                      <span className="text-green-400 mr-2 mt-0.5">•</span>
                      Collateral required: 100% in LARRY
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-400 mr-2 mt-0.5">•</span>
                      Borrow up to 99% of collateral value
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2 mt-0.5">•</span>
                      Interest: ~3.9% APR + 0.1% base
                    </li>
                  </ul>
                </div>

                <Button
                  onClick={handleAction}
                  disabled={!amount || parseFloat(amount) <= 0 || isLoading}
                  className="w-full py-4 text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🔄</span>
                      Borrow {amount} ETH
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        );
        
      case 'positions':
        return (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-purple-800/30 shadow-lg">
            {loanData && !loanData.isExpired ? (
              <>
                <h3 className="font-bold text-white mb-4 flex items-center">
                  <span className="text-xl mr-2">📊</span>
                  Position Management
                </h3>

                <div className="bg-gradient-to-r from-purple-800/30 to-indigo-800/30 rounded-xl p-4 mb-4 border border-purple-700/50">
                  <h4 className="text-lg font-bold text-purple-300 mb-3 flex items-center">
                    <span className="text-xl mr-2">⚡</span>
                    Active Position
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Borrowed</p>
                      <p className="text-xl font-bold text-white">{formatEth(loanData.borrowed)} ETH</p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Collateral</p>
                      <p className="text-xl font-bold text-white">{formatLarry(loanData.collateral)} LARRY</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Expires</p>
                      <p className="text-lg font-bold text-white">
                        {new Date(Number(loanData.endDate) * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <p className="text-sm text-gray-300 mb-1">Health</p>
                      <p className="text-xl font-bold text-green-400">
                        {((Number(loanData.collateral) / Number(loanData.borrowed)) * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => repay(formatEther(loanData.borrowed))}
                    disabled={isLoading}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">💰</span>
                    Repay Full
                  </Button>

                  <Button
                    onClick={flashClosePosition}
                    disabled={isLoading}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">⚡</span>
                    Flash Close
                  </Button>

                  <Button
                    onClick={() => {
                      const daysToExtend = prompt('Days to extend:');
                      if (daysToExtend) extendLoan(parseInt(daysToExtend));
                    }}
                    disabled={isLoading}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">📅</span>
                    Extend Loan
                  </Button>

                  <Button
                    onClick={() => {
                      const collateralAmount = prompt('LARRY amount to remove:');
                      if (collateralAmount) removeCollateral(collateralAmount);
                    }}
                    disabled={isLoading}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">🔓</span>
                    Remove Collateral
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-6 mb-4 border border-gray-600">
                  <p className="text-gray-300 text-lg font-medium mb-2">No Active Positions</p>
                  <p className="text-sm text-gray-400">
                    Open a leverage position or borrow to get started with Larry Talbot
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => setActiveTab('leverage')}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">⚡</span>
                    Leverage
                  </Button>
                  <Button
                    onClick={() => setActiveTab('borrow')}
                    className="py-3 text-sm font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <span className="mr-2">🔄</span>
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
    <div className={`bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 ${isFullscreen ? 'min-h-screen' : 'rounded-2xl'} p-4 ${className}`}>
      {isFullscreen && onBack && (
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-purple-300 hover:text-white transition-all hover:gap-3 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-semibold">Back</span>
        </button>
      )}

      {/* Modern Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/50">
              🐺
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Larry Talbot</h2>
              <p className="text-purple-300 text-sm">DeFi Trading Hub</p>
            </div>
          </div>
          <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg backdrop-blur-sm">
            <span className="text-xs font-semibold text-purple-300">⚡ Live</span>
          </div>
        </div>
      </div>
      
      {/* Modern Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-purple-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-purple-500/20 flex items-center justify-center text-xs">💎</div>
              <p className="text-xs text-purple-300 font-semibold">Price</p>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {formatPrice(stats.price)} Ξ
            </p>
            {stats.price > 0n && stats.price < parseEther('0.01') && (
              <p className="text-xs text-purple-400">
                {(Number(stats.price) / 10**18).toFixed(12).replace(/\.?0+$/, '')} ETH
              </p>
            )}
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center text-xs">💰</div>
              <p className="text-xs text-blue-300 font-semibold">Balance</p>
            </div>
            <p className="text-2xl font-bold text-white truncate">
              {formatLarry(stats.userBalance)}
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-green-500/20 flex items-center justify-center text-xs">📊</div>
              <p className="text-xs text-green-300 font-semibold">Supply</p>
            </div>
            <p className="text-2xl font-bold text-white truncate">
              {formatLarry(stats.totalSupply)}
            </p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
          <div className="relative bg-slate-900/90 backdrop-blur-xl p-4 rounded-2xl border border-amber-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center text-xs">🔒</div>
              <p className="text-xs text-amber-300 font-semibold">Backing</p>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatEth(stats.backing)} ETH
            </p>
          </div>
        </div>
      </div>
      
      {/* Modern Tab Navigation */}
      <div className="mb-6">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl p-1.5 border border-purple-500/20">
          <div className="grid grid-cols-5 gap-1">
            {LEVERAGE_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const icons = {
                buy: '💰',
                sell: '📈',
                leverage: '⚡',
                borrow: '🔄',
                positions: '📊'
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 px-2 rounded-xl transition-all duration-300 flex flex-col items-center font-semibold text-xs ${
                    isActive
                      ? 'text-white scale-105'
                      : 'text-gray-400 hover:text-white hover:scale-105'
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl shadow-lg shadow-purple-500/50"></div>
                  )}
                  <span className={`relative text-xl mb-1 transition-transform ${isActive ? 'scale-110' : ''}`}>
                    {icons[tab.id as keyof typeof icons]}
                  </span>
                  <span className="relative">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="mb-4">
        {renderTabContent()}
      </div>
      
      {/* Status Messages */}
      {status && (
        <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-400 border-t-transparent rounded-full mr-3"></div>
            <p className="text-sm font-medium text-blue-300">{status}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/50 rounded-xl p-4 mb-4 backdrop-blur-sm">
          <div className="flex items-center">
            <span className="text-lg mr-3">❌</span>
            <p className="text-sm font-medium text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Protocol Stats */}
      <div className="mt-6 pt-6 border-t border-purple-800/30">
        <h3 className="text-lg font-bold text-purple-300 mb-4 flex items-center">
          <span className="text-xl mr-2">📊</span>
          Protocol Statistics
        </h3>
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-purple-800/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Total Borrowed</p>
              <p className="text-xl font-bold text-yellow-400">{formatEth(totalBorrowed)} ETH</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-1">Total Collateral</p>
              <p className="text-xl font-bold text-green-400">{formatLarry(totalCollateral)} LARRY</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}