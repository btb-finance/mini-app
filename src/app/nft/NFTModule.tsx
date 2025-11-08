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
    <div className={`bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 ${isFullscreen ? 'min-h-screen' : 'rounded-2xl'} p-4 ${className}`}>
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

      {/* Modern NFT Header */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative bg-gradient-to-br from-indigo-500/20 to-pink-500/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-600 flex items-center justify-center text-3xl shadow-2xl shadow-purple-500/50">
                  💎
                </div>
                <div>
                  <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300">
                    BTB NFTs
                  </h2>
                  <p className="text-purple-200 text-sm font-semibold">Exclusive Digital Collectibles</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-purple-300">COLLECTION</div>
                <div className="text-2xl font-black text-white">✨</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Display transaction status */}
      {isProcessing ? (
        <div className="text-center py-2 mb-2 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
          <div className="animate-spin h-6 w-6 border-2 border-[#1A1E23] dark:border-[#FFFFFF] border-t-transparent rounded-full mx-auto mb-1"></div>
          <p className="text-gray-800 dark:text-gray-200 text-xs">Processing...</p>
        </div>
      ) : txMessage ? (
        <div className={`p-2 rounded mb-2 text-xs mx-auto ${txMessage.includes("Success") ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"}`} style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
          {txMessage}
        </div>
      ) : null}

      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <h3 className="font-bold mb-2 text-gray-800 dark:text-white flex items-center">
          <span className="text-2xl mr-2">💎</span>
          Exclusive BTB NFTs
        </h3>
        <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
          <li className="flex items-start">
            <span className="text-green-500 mr-2 mt-0.5">•</span>
            Mint limited edition BTB NFTs
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2 mt-0.5">•</span>
            Each NFT costs {NFT_PRICE_BTB} BTB tokens
          </li>
          <li className="flex items-start">
            <span className="text-purple-500 mr-2 mt-0.5">•</span>
            NFTs can be traded on major marketplaces
          </li>
          <li className="flex items-start">
            <span className="text-orange-500 mr-2 mt-0.5">•</span>
            Get exclusive access to BTB features
          </li>
        </ul>
      </div>
      
      {/* NFT Collection Stats */}
      <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <h3 className="font-bold mb-3 text-gray-800 dark:text-white flex items-center">
          <span className="text-xl mr-2">📊</span>
          Collection Stats
        </h3>
        {isLoadingNFT ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : nftDetails ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Total Minted</p>
              <p className="font-bold text-lg text-blue-800 dark:text-blue-200">{nftDetails.totalSupply} / {nftDetails.maxSupply}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-3 rounded-lg border border-green-200 dark:border-green-700">
              <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Available</p>
              <p className="font-bold text-lg text-green-800 dark:text-green-200">{nftDetails.remainingSupply}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Price</p>
              <p className="font-bold text-lg text-purple-800 dark:text-purple-200">{nftDetails.pricePerNFT} BTB</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-3 rounded-lg border border-orange-200 dark:border-orange-700">
              <p className="text-xs font-medium text-orange-700 dark:text-orange-300 mb-1">You Own</p>
              <p className="font-bold text-lg text-orange-800 dark:text-orange-200">{nftDetails.ownedNFTs}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-sm text-center py-4">Failed to load NFT details</p>
        )}

        <button
          onClick={getNFTDetails}
          disabled={isLoadingNFT || false}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-3 flex items-center mx-auto font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Stats
        </button>
      </div>

      {/* Mint Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 mb-4 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <h3 className="font-bold mb-4 text-gray-800 dark:text-white flex items-center">
          <span className="text-xl mr-2">⚡</span>
          Mint Your NFTs
        </h3>

        <div className="mb-4">
          <Label htmlFor="nft-count" className="font-semibold mb-2 block text-sm text-gray-700 dark:text-gray-300">
            Number of NFTs to Mint
          </Label>
          <Input
            id="nft-count"
            type="number"
            placeholder="Enter quantity (max 100)"
            style={{color: 'black', backgroundColor: 'white'}}
            className="border-2 border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 font-medium p-3 rounded-xl w-full text-sm dark:text-black transition-colors"
            value={nftCount}
            onChange={(e) => setNftCount(e.target.value)}
            min="1"
            max={nftDetails?.remainingSupply.toString() || "100"}
            disabled={isProcessing}
          />
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4 border border-blue-100 dark:border-blue-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Cost:</span>
            <div className="text-right">
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalPrice} BTB</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">≈ ${totalPrice} USD</p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => buyNFT(nftCount)}
          disabled={!!(isProcessing || !isConnected || !nftCount || parseInt(nftCount) <= 0 || (nftDetails && parseInt(nftCount) > nftDetails.remainingSupply))}
          className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isConnected ? (
            <>
              <span className="mr-2">🔗</span>
              Connect Wallet to Mint
            </>
          ) : isProcessing ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Minting NFTs...
            </>
          ) : (
            <>
              <span className="mr-2">🚀</span>
              Mint {nftCount || '0'} NFT{nftCount !== '1' ? 's' : ''}
            </>
          )}
        </Button>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-medium">Smart Contract:</span>
        </p>
        <a
          href={`https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm font-mono bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-blue-600 dark:text-blue-400"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          {NFT_CONTRACT_ADDRESS.slice(0, 8)}...{NFT_CONTRACT_ADDRESS.slice(-6)}
        </a>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          View on BaseScan ↗
        </p>
      </div>
    </div>
  );
} 