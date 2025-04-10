import { useState, useCallback, useEffect } from "react";
import { useAccount, useSendTransaction, usePublicClient, useReadContract } from "wagmi";
import { NFT_CONTRACT_ADDRESS, BTB_TOKEN_ADDRESS, NFT_PRICE_BTB } from "./constants";
import nftAbi from "./nftabi.json";
import { formatUnits } from "viem";

export interface NFTDetails {
  totalSupply: number;
  maxSupply: number;
  remainingSupply: number;
  pricePerNFT: number;
  ownedNFTs: number;
}

export interface UseNFTOptions {
  onSuccess?: (message: string) => void;
  onError?: (error: Error) => void;
}

export function useNFT(options?: UseNFTOptions) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [txMessage, setTxMessage] = useState("");
  const [nftDetails, setNftDetails] = useState<NFTDetails | null>(null);
  const [isLoadingNFT, setIsLoadingNFT] = useState(false);
  
  const { address, isConnected } = useAccount();
  const { sendTransaction } = useSendTransaction();
  const publicClient = usePublicClient();

  // Helper function to update status and optionally trigger callbacks
  const updateStatus = useCallback((message: string, isError = false) => {
    setTxMessage(message);
    if (isError && options?.onError) {
      options.onError(new Error(message));
    } else if (!isError && message.includes("Success") && options?.onSuccess) {
      options.onSuccess(message);
    }
  }, [options]);

  // Get NFT details
  const getNFTDetails = useCallback(async () => {
    if (!publicClient) {
      return null;
    }
    
    try {
      setIsLoadingNFT(true);
      
      // Get total supply
      const totalSupply = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftAbi,
        functionName: "totalSupply",
        args: []
      });
      
      // Get max supply
      const maxSupply = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftAbi,
        functionName: "MAX_SUPPLY",
        args: []
      });
      
      // Get remaining supply
      const remainingSupply = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftAbi,
        functionName: "remainingSupply",
        args: []
      });
      
      // Get price per NFT
      const pricePerNFT = await publicClient.readContract({
        address: NFT_CONTRACT_ADDRESS as `0x${string}`,
        abi: nftAbi,
        functionName: "pricePerNFT",
        args: []
      });
      
      // Get user's NFT balance if connected
      let ownedNFTs = 0;
      if (isConnected && address) {
        const balance = await publicClient.readContract({
          address: NFT_CONTRACT_ADDRESS as `0x${string}`,
          abi: nftAbi,
          functionName: "balanceOf",
          args: [address]
        });
        ownedNFTs = Number(balance);
      }
      
      const details: NFTDetails = {
        totalSupply: Number(totalSupply),
        maxSupply: Number(maxSupply),
        remainingSupply: Number(remainingSupply),
        pricePerNFT: Number(formatUnits(BigInt(pricePerNFT as string || "0"), 18)),
        ownedNFTs
      };
      
      console.log("NFT details:", details);
      setNftDetails(details);
      return details;
    } catch (error) {
      console.error("Failed to get NFT details:", error);
      return null;
    } finally {
      setIsLoadingNFT(false);
    }
  }, [publicClient, isConnected, address]);

  // Fetch NFT details on component mount and when address changes
  useEffect(() => {
    getNFTDetails();
  }, [getNFTDetails]);

  // Buy NFTs
  const buyNFT = useCallback(async (nftCount: string) => {
    if (!isConnected || !address) {
      updateStatus("Please connect your wallet first", true);
      return;
    }
    
    try {
      setIsProcessing(true);
      updateStatus("Approving token transfer...");
      
      // Calculate amount in wei (BTB has 18 decimals)
      const count = parseInt(nftCount);
      const amount = BigInt(count * NFT_PRICE_BTB * (10 ** 18));
      
      // First send approval transaction for BTB token
      await sendTransaction({
        to: BTB_TOKEN_ADDRESS,
        // approve(address spender, uint256 amount)
        data: `0x095ea7b3000000000000000000000000${NFT_CONTRACT_ADDRESS.slice(2)}${amount.toString(16).padStart(64, '0')}`,
      });
      
      updateStatus("Waiting for approval confirmation...");
      // Delay to let the approval transaction propagate
      await new Promise(resolve => setTimeout(resolve, 15000));
      
      updateStatus("Buying NFTs...");
      // Then send the buy transaction
      await sendTransaction({
        to: NFT_CONTRACT_ADDRESS,
        // buyNFT(uint256 amount)
        data: `0x2d296bf1${BigInt(count).toString(16).padStart(64, '0')}`,
      });
      
      updateStatus(`Success! Purchased ${nftCount} NFT${count > 1 ? 's' : ''}. View transaction on chain explorer.`);
      
      // Refresh NFT details after purchase
      setTimeout(() => {
        getNFTDetails();
      }, 5000); // Wait 5 seconds before refreshing
      
    } catch (error) {
      console.error("Transaction failed:", error);
      updateStatus(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, true);
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, sendTransaction, updateStatus, getNFTDetails]);

  return {
    buyNFT,
    getNFTDetails,
    isProcessing,
    txMessage,
    isConnected,
    nftDetails,
    isLoadingNFT
  };
} 