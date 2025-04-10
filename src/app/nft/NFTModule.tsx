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
    <div className={`p-3 bg-[#1A1E23]/10 dark:bg-[#1A1E23]/20 rounded-lg w-full ${isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto rounded-none bg-white dark:bg-gray-900' : 'max-w-[300px] mx-auto'} text-sm ${className}`}>
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
          <h2 className="text-lg font-bold text-center pt-1.5 pb-1 text-black dark:text-white">BTB NFTs</h2>
        </div>
      )}
      
      {!isFullscreen && (
        <h2 className="text-lg font-bold mb-2">BTB NFTs</h2>
      )}
      
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

      <div className="mb-3 p-2 bg-[#1A1E23]/5 rounded text-xs mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <h3 className="font-medium mb-1 text-black dark:text-white">Exclusive BTB NFTs:</h3>
        <ul className="list-disc pl-4 space-y-0.5 text-gray-800 dark:text-gray-200">
          <li>Mint limited edition BTB NFTs</li>
          <li>Each NFT costs {NFT_PRICE_BTB} BTB tokens</li>
          <li>NFTs can be traded on major marketplaces</li>
          <li>Get exclusive access to BTB features</li>
        </ul>
      </div>
      
      {/* NFT Collection Stats */}
      <div className="mb-3 p-2 bg-[#1A1E23]/5 rounded mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <h3 className="font-medium mb-2 text-black dark:text-white text-xs">Collection Stats:</h3>
        {isLoadingNFT ? (
          <div className="flex justify-center">
            <div className="animate-spin h-4 w-4 border-2 border-[#1A1E23] dark:border-[#FFFFFF] border-t-transparent rounded-full"></div>
          </div>
        ) : nftDetails ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Minted</p>
              <p className="font-bold text-black dark:text-white">{nftDetails.totalSupply} / {nftDetails.maxSupply}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Available</p>
              <p className="font-bold text-black dark:text-white">{nftDetails.remainingSupply}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">Price</p>
              <p className="font-bold text-black dark:text-white">{nftDetails.pricePerNFT} BTB</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-2 rounded">
              <p className="text-xs text-gray-600 dark:text-gray-400">You Own</p>
              <p className="font-bold text-black dark:text-white">{nftDetails.ownedNFTs}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400 text-xs text-center">Failed to load NFT details</p>
        )}
        
        <button 
          onClick={getNFTDetails}
          disabled={isLoadingNFT || false}
          className="text-xs text-[#1A1E23] dark:text-white hover:underline mt-2 flex items-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
      
      {/* NFT Preview Cards - Hard-coded for now */}
      <div className="mb-4 grid grid-cols-2 gap-2 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <div className="p-2 bg-white dark:bg-gray-800 rounded text-center">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-20 w-full rounded-md mb-2 flex items-center justify-center">
            <span className="text-white font-bold">BTB</span>
          </div>
          <p className="font-bold text-xs text-black dark:text-white">BTB Genesis</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{NFT_PRICE_BTB} BTB</p>
        </div>
        <div className="p-2 bg-white dark:bg-gray-800 rounded text-center">
          <div className="bg-gradient-to-br from-green-500 to-yellow-500 h-20 w-full rounded-md mb-2 flex items-center justify-center">
            <span className="text-white font-bold">BTB</span>
          </div>
          <p className="font-bold text-xs text-black dark:text-white">BTB Founder</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{NFT_PRICE_BTB} BTB</p>
        </div>
      </div>
      
      {/* Mint Form */}
      <div className="mb-2 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <Label htmlFor="nft-count" className="font-medium mb-1 block text-xs text-black dark:text-white">Number of NFTs to Mint</Label>
        <Input 
          id="nft-count" 
          type="number" 
          placeholder="Enter number of NFTs" 
          style={{color: 'black', backgroundColor: 'white'}}
          className="border-2 border-[#1A1E23]/50 focus:border-[#1A1E23] font-medium p-1.5 rounded w-full text-sm dark:text-black"
          value={nftCount}
          onChange={(e) => setNftCount(e.target.value)}
          min="1"
          max={nftDetails?.remainingSupply.toString() || "1"}
          disabled={isProcessing}
        />
      </div>
      
      <div className="text-right mb-2 mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <p className="text-xs text-gray-800 dark:text-gray-200">Total Cost: {totalPrice} BTB</p>
      </div>
      
      <div className="mx-auto" style={{maxWidth: isFullscreen ? '90%' : '100%'}}>
        <Button 
          onClick={() => buyNFT(nftCount)}
          disabled={!!(isProcessing || !isConnected || !nftCount || parseInt(nftCount) <= 0 || (nftDetails && parseInt(nftCount) > nftDetails.remainingSupply))}
          className="py-2 text-sm w-full"
        >
          {!isConnected ? "Connect Wallet to Mint" : "Mint NFT"}
        </Button>
      </div>
      
      <div className="mt-2 text-center">
        <p className="text-xs text-gray-600 dark:text-gray-400">
          Contract: <a href={`https://basescan.org/address/${NFT_CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer" className="underline">
            {NFT_CONTRACT_ADDRESS.slice(0, 6)}...{NFT_CONTRACT_ADDRESS.slice(-4)}
          </a>
        </p>
      </div>
    </div>
  );
} 