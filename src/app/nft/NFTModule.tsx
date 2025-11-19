"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/Button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useNFT } from "./useNFT";
import {
  NFT_CONTRACT_ADDRESS,
  NFT_PRICE_BTB,
  DEFAULT_NFT_COUNT
} from "./constants";

export interface NFTModuleProps {
  className?: string;
  isFullscreen?: boolean;
  onBack?: () => void;
}

export function NFTModule({ className = "", isFullscreen = false, onBack }: NFTModuleProps) {
  const [nftCount, setNftCount] = useState(DEFAULT_NFT_COUNT);
  const [totalPrice, setTotalPrice] = useState("0");

  const {
    buyNFT,
    getNFTDetails,
    isProcessing,
    txMessage,
    isConnected,
    nftDetails,
    isLoadingNFT
  } = useNFT();

  // Update total price when NFT count changes
  useEffect(() => {
    const count = parseInt(nftCount) || 0;
    setTotalPrice((count * NFT_PRICE_BTB).toString());
  }, [nftCount]);

  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-950 to-black ${isFullscreen ? 'min-h-screen' : 'rounded-3xl shadow-2xl'} p-6 ${className}`}>
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        {isFullscreen && onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center text-indigo-300 hover:text-white transition-colors group"
          >
            <span className="mr-2 transform group-hover:-translate-x-1 transition-transform">←</span>
            Back to Home
          </button>
        )}

        {/* Premium Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center p-4 bg-indigo-500/10 rounded-2xl mb-4 backdrop-blur-sm border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
            <span className="text-5xl filter drop-shadow-lg">💎</span>
          </div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 mb-2">
            BTB Exclusive NFTs
          </h2>
          <p className="text-indigo-200/70 text-sm font-medium tracking-wide uppercase">
            Mint • Collect • Trade • Earn
          </p>
        </div>

        {/* Transaction Status */}
        {isProcessing ? (
          <div className="text-center py-3 mb-6 mx-auto bg-blue-900/30 border border-blue-500/30 rounded-xl backdrop-blur-md" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
            <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-blue-200 text-xs font-medium">Processing Transaction...</p>
          </div>
        ) : txMessage ? (
          <div className={`p-4 rounded-xl mb-6 text-sm font-medium border backdrop-blur-md mx-auto ${txMessage.includes("Success")
            ? "bg-green-500/20 border-green-500/30 text-green-200"
            : "bg-red-500/20 border-red-500/30 text-red-200"
            }`} style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
            {txMessage}
          </div>
        ) : null}

        {/* Features Card */}
        <div className="mb-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl mx-auto" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
          <h3 className="font-bold mb-4 text-white text-lg flex items-center">
            <span className="w-1 h-6 bg-indigo-500 rounded-full mr-3"></span>
            Utility & Benefits
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { text: "Limited Edition Mint", color: "text-green-400" },
              { text: `${NFT_PRICE_BTB} BTB per NFT`, color: "text-blue-400" },
              { text: "Tradable on Marketplaces", color: "text-purple-400" },
              { text: "Exclusive Feature Access", color: "text-orange-400" }
            ].map((item, i) => (
              <div key={i} className="flex items-center bg-black/20 rounded-xl p-3 border border-white/5">
                <span className={`${item.color} mr-3 text-lg`}>•</span>
                <span className="text-gray-300 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Collection Stats Dashboard */}
        <div className="mb-8 p-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-2xl mx-auto" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-white text-lg flex items-center">
              <span className="w-1 h-6 bg-pink-500 rounded-full mr-3"></span>
              Collection Stats
            </h3>
            <button
              onClick={getNFTDetails}
              disabled={isLoadingNFT}
              className="text-xs font-bold text-pink-400 hover:text-pink-300 bg-pink-500/10 px-3 py-1.5 rounded-lg border border-pink-500/20 transition-colors"
            >
              Refresh
            </button>
          </div>

          {isLoadingNFT ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-10 w-10 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
          ) : nftDetails ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 p-4 rounded-2xl border border-blue-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">📊</div>
                <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">Total Minted</p>
                <p className="font-black text-2xl text-white">{nftDetails.totalSupply} <span className="text-sm text-blue-400 font-medium">/ {nftDetails.maxSupply}</span></p>
                <div className="w-full bg-blue-900/50 h-1.5 mt-3 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{ width: `${(nftDetails.totalSupply / nftDetails.maxSupply) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 p-4 rounded-2xl border border-green-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">🟢</div>
                <p className="text-xs font-bold text-green-300 uppercase tracking-wider mb-1">Available</p>
                <p className="font-black text-2xl text-white">{nftDetails.remainingSupply}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 p-4 rounded-2xl border border-purple-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">🏷️</div>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">Price</p>
                <p className="font-black text-2xl text-white">{nftDetails.pricePerNFT} <span className="text-sm text-purple-400 font-medium">BTB</span></p>
              </div>

              <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 p-4 rounded-2xl border border-orange-500/20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity text-4xl">🎒</div>
                <p className="text-xs font-bold text-orange-300 uppercase tracking-wider mb-1">You Own</p>
                <p className="font-black text-2xl text-white">{nftDetails.ownedNFTs}</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-white/5 rounded-2xl border border-white/5 border-dashed">
              <p className="text-gray-400 text-sm mb-4">Failed to load collection data</p>
              <Button
                onClick={getNFTDetails}
                className="py-2 px-6 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
              >
                Retry
              </Button>
            </div>
          )}
        </div>

        {/* Mint Form */}
        <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-indigo-500/30 p-6 mb-8 mx-auto relative overflow-hidden" style={{ maxWidth: isFullscreen ? '90%' : '100%' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          <h3 className="font-bold mb-6 text-white text-xl flex items-center justify-center">
            <span className="text-2xl mr-3 animate-bounce">⚡</span>
            Mint Your NFTs
          </h3>

          <div className="mb-6">
            <Label htmlFor="nft-count" className="font-bold mb-3 block text-sm text-indigo-200 text-center uppercase tracking-wide">
              Quantity
            </Label>
            <div className="flex items-center justify-center">
              <div className="relative w-full max-w-[200px]">
                <Input
                  id="nft-count"
                  type="number"
                  placeholder="1"
                  className="bg-black/50 border-2 border-indigo-500/30 focus:border-indigo-400 text-white p-4 rounded-2xl w-full text-center text-2xl font-black transition-all shadow-inner"
                  value={nftCount}
                  onChange={(e) => setNftCount(e.target.value)}
                  min="1"
                  max={nftDetails?.remainingSupply.toString() || "100"}
                  disabled={isProcessing}
                />
              </div>
            </div>
          </div>

          <div className="bg-black/30 rounded-xl p-4 mb-6 border border-white/10 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-300">Total Cost:</span>
            <div className="text-right">
              <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300">{totalPrice} BTB</p>
            </div>
          </div>

          <Button
            onClick={() => buyNFT(nftCount)}
            disabled={!!(isProcessing || !isConnected || !nftCount || parseInt(nftCount) <= 0 || (nftDetails && parseInt(nftCount) > nftDetails.remainingSupply))}
            className="w-full py-4 text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {!isConnected ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">🔗</span> Connect Wallet
              </span>
            ) : isProcessing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                Minting...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🚀</span> Mint {nftCount || '0'} NFT{nftCount !== '1' ? 's' : ''}
              </span>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <a
            href={`https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs font-mono text-gray-500 hover:text-indigo-400 transition-colors bg-black/20 px-4 py-2 rounded-full border border-white/5 hover:border-indigo-500/30"
          >
            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
            Contract: {NFT_CONTRACT_ADDRESS.slice(0, 6)}...{NFT_CONTRACT_ADDRESS.slice(-4)}
            <svg className="w-3 h-3 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
} 