"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import { Input } from "../components/ui/input";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import sdk, {
  SignIn as SignInCore,
} from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignMessage,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
  useReadContract,
} from "wagmi";

import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError, formatUnits } from "viem";
import { useSession } from "next-auth/react";
import { Label } from "~/components/ui/label";
import { useFrame } from "~/components/providers/FrameProvider";
import tokenAbi from "../app/token/tokenabi.json";
import { MegaPotModule } from "../app/megapot";
import { ChicksModule } from "../app/chicks";
import { NFTModule } from "../app/nft";
import { NFT_PRICE_BTB } from "../app/nft/constants";
import { LarryModule } from "../app/larry";

// BTB Token contract address
const BTB_TOKEN_ADDRESS = "0x888e85C95c84CA41eEf3E4C8C89e8dcE03e41488";

export default function Demo(
  { title }: { title?: string } = { title: "BTB Finance" }
) {
  const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult } = useFrame();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [sendNotificationResult, setSendNotificationResult] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [tokenBalance, setTokenBalance] = useState<string>("0");

  // Read BTB token balance
  const { data: balanceData } = useReadContract(
    isConnected && address ? {
      address: BTB_TOKEN_ADDRESS as `0x${string}`,
      abi: tokenAbi,
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    } : undefined
  );

  // Update token balance when data changes
  useEffect(() => {
    if (balanceData) {
      // Format the balance with 18 decimals (standard for most ERC20 tokens)
      setTokenBalance(formatUnits(balanceData as bigint, 18));
    }
  }, [balanceData]);

  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect } = useConnect();

  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

  const nextChain = useMemo(() => {
    if (chainId === base.id) {
      return optimism;
    } else if (chainId === optimism.id) {
      return degen;
    } else if (chainId === degen.id) {
      return mainnet;
    } else if (chainId === mainnet.id) {
      return unichain;
    } else {
      return base;
    }
  }, [chainId]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: nextChain.id });
  }, [switchChain, nextChain.id]);

  const openUrl = useCallback(() => {
    sdk.actions.openUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  }, []);

  const openWarpcastUrl = useCallback(() => {
    sdk.actions.openUrl("https://warpcast.com/~/compose");
  }, []);

  const close = useCallback(() => {
    sdk.actions.close();
  }, []);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) {
      return;
    }

    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });

      if (response.status === 200) {
        setSendNotificationResult("Success");
        return;
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited");
        return;
      }

      const data = await response.text();
      setSendNotificationResult(`Error: ${data}`);
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  const sendTx = useCallback(() => {
    sendTransaction(
      {
        // call yoink() on Yoink contract
        to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
        data: "0x9846cd9efc000023c0",
      },
      {
        onSuccess: (hash) => {
          setTxHash(hash);
        },
      }
    );
  }, [sendTransaction]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: {
        name: "Frames v2 Demo",
        version: "1",
        chainId,
      },
      types: {
        Message: [{ name: "content", type: "string" }],
      },
      message: {
        content: "Hello from Frames v2!",
      },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  const toggleContext = useCallback(() => {
    setIsContextOpen((prev) => !prev);
  }, []);

  // Feature handlers
  const handleFeatureClick = (feature: string) => {
    if (feature === 'megapot' || feature === 'chicks' || feature === 'nft' || feature === 'larry') {
      setIsFullscreen(true);
    }
    setActiveFeature(feature);
  };

  const handleBackFromFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setActiveFeature(null);
  }, []);

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'megapot':
        return (
          <MegaPotModule 
            isFullscreen={isFullscreen} 
            onBack={handleBackFromFullscreen}
          />
        );
      case 'chicks':
        return (
          <ChicksModule 
            isFullscreen={isFullscreen} 
            onBack={handleBackFromFullscreen}
          />
        );
      case 'nft':
        return (
          <NFTModule 
            isFullscreen={isFullscreen} 
            onBack={handleBackFromFullscreen}
          />
        );
      case 'larry':
        return (
          <LarryModule 
            isFullscreen={isFullscreen} 
            onBack={handleBackFromFullscreen}
          />
        );
      default:
        return null;
    }
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black min-h-screen"
    >
      <div className={`${isFullscreen ? 'w-full max-w-md' : 'w-full max-w-[400px]'} mx-auto py-4 px-3`}>
        {/* App title - hide when in fullscreen */}
        {!isFullscreen && (
          <div className="text-center mb-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              Decentralized Finance Ecosystem
            </p>
          </div>
        )}

        {/* Connect wallet button if not connected - hide when in fullscreen */}
        {!isConnected && !isFullscreen && (
          <div className="mb-6 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-4 border border-gray-100 dark:border-gray-700">
              <div className="mb-4 h-20 sm:h-24 flex items-center justify-center">
                <img src="/logo.avif" alt="BTB Finance Logo" className="h-20 w-20 object-contain" />
              </div>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Welcome to BTB Finance</h2>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Connect your wallet to access the BTB Finance ecosystem and explore all features.
              </p>
              <Button
                onClick={() => connect({ connector: config.connectors[0] })}
                className="w-full py-3 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg"
              >
                Connect Wallet
              </Button>
            </div>
            
          </div>
        )}

        {/* Add BTB Token Balance Display - hide when in fullscreen */}
        {isConnected && !isFullscreen && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 mb-4 border border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Wallet</h2>
                <Button
                  onClick={() => disconnect()}
                  className="text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 py-2 px-3 rounded-lg"
                >
                  Disconnect
                </Button>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-3">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Your BTB Balance</div>
                <div className="flex items-end">
                  <span className="text-3xl font-bold text-gray-800 dark:text-white">{parseFloat(tokenBalance).toFixed(2)}</span>
                  <span className="ml-2 text-sm font-semibold text-blue-600 dark:text-blue-400">BTB</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Connected Address</div>
                <div className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                  {address ? address.slice(0, 8) + '...' + address.slice(-6) : ''}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Feature Buttons - hide when in fullscreen */}
        {!isFullscreen && (
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Explore BTB Finance</h2>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-700"
                onClick={() => handleFeatureClick('megapot')}
              >
                <div className="h-20 sm:h-24 bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center relative">
                  <span className="text-white font-bold text-2xl">🎯</span>
                  <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    15% CASHBACK
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">Mega Pot</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Win big with BTB</p>
                </div>
              </div>
              
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-700"
                onClick={() => handleFeatureClick('chicks')}
              >
                <div className="h-20 sm:h-24 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🐥</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">Chicks</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trade & earn with Chicks</p>
                </div>
              </div>
              
              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-700"
                onClick={() => handleFeatureClick('nft')}
              >
                <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🖼️</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">NFT Collection</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Mint BTB NFTs for {NFT_PRICE_BTB} BTB</p>
                </div>
              </div>

              <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-xl border border-gray-100 dark:border-gray-700"
                onClick={() => handleFeatureClick('larry')}
              >
                <div className="h-20 sm:h-24 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">🐺</span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-1">Larry Talbot</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Trade, leverage & borrow</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Content */}
        {activeFeature && renderFeatureContent()}

        {/* Share Button - hide when in fullscreen mode */}
        {!isFullscreen && (
          <div className="mb-4">
            <Button
              onClick={addFrame}
              className="w-full py-2 text-sm bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium rounded-xl flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share BTB Finance
            </Button>
            {added && (
              <div className="mt-2 text-xs text-center text-green-600 dark:text-green-400">
                Frame added successfully! You can now find BTB Finance in your app list.
              </div>
            )}
          </div>
        )}
        
        {/* Footer - hide when a feature is active or in fullscreen mode */}
        {!activeFeature && !isFullscreen && (
          <div className="text-center text-[10px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-1">© 2023 BTB Finance. All rights reserved.</p>
            <div className="flex justify-center space-x-3 mt-1">
              <a href="https://twitter.com/btb_finance" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                </svg>
                X
              </a>
              <a href="https://t.me/btbfinance" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248c-.14.63-.37 2.752-.521 3.653-.63 3.486-1.247 5.359-1.654 5.359-.281 0-.521-.416-.984-1.239-1.826-2.929-2.59-4.527-3.067-4.527-.119 0-.34.17-.661.511-.601.601-.863 1.247-.863 1.933 0 .833.416 1.736 1.247 2.712.833.976 1.736 1.933 2.712 2.87 1.176 1.106 2.383 1.933 3.618 2.474 1.176.542 2.193.833 3.067.833.976 0 1.796-.17 2.473-.511.676-.34 1.176-.781 1.499-1.316.323-.542.484-1.176.484-1.903 0-.34-.051-.601-.17-.781-.119-.17-.323-.281-.601-.34-.281-.051-.781-.051-1.499 0-1.654.119-2.929.119-3.829 0-.893-.119-1.569-.391-2.023-.833-.456-.44-.781-.976-.976-1.596-.119-.34-.119-.661 0-.976.119-.323.34-.601.661-.833.323-.231.691-.34 1.106-.34.781 0 1.569.34 2.383 1.019.833.681 1.654 1.596 2.473 2.752.833 1.176 1.499 2.193 1.994 3.067.494.833.893 1.247 1.176 1.247.34 0 .601-.119.781-.34.17-.231.281-.601.34-1.106.051-.511.119-1.316.17-2.383.051-1.074.051-1.903 0-2.473-.051-.571-.17-.976-.34-1.247-.17-.281-.456-.456-.833-.511-.381-.051-.893-.051-1.569 0z"/>
                </svg>
                Telegram
              </a>
              <a href="https://www.btb.finance" target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"></path>
                </svg>
                Docs
              </a>
            </div>
          </div>
        )}
        
        {/* Back button when a feature is active - hide when in fullscreen (MegaPot has its own back button) */}
        {activeFeature && !isFullscreen && (
          <div className="mt-3">
            <Button onClick={() => setActiveFeature(null)} className="text-xs py-1.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white">
              ← Back to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SignMessage() {
  const { isConnected } = useAccount();
  const { connectAsync } = useConnect();
  const {
    signMessage,
    data: signature,
    error: signError,
    isError: isSignError,
    isPending: isSignPending,
  } = useSignMessage();

  const handleSignMessage = useCallback(async () => {
    if (!isConnected) {
      await connectAsync({
        chainId: base.id,
        connector: config.connectors[0],
      });
    }

    signMessage({ message: "Hello from Frames v2!" });
  }, [connectAsync, isConnected, signMessage]);

  return (
    <>
      <Button
        onClick={handleSignMessage}
        disabled={isSignPending}
        isLoading={isSignPending}
      >
        Sign Message
      </Button>
      {isSignError && renderError(signError)}
      {signature && (
        <div className="mt-2 text-xs">
          <div>Signature: {signature}</div>
        </div>
      )}
    </>
  );
}

function SendEth() {
  const { isConnected, chainId } = useAccount();
  const {
    sendTransaction,
    data,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: data,
    });

  const toAddr = useMemo(() => {
    // Protocol guild address
    return chainId === base.id
      ? "0x32e3C7fD24e175701A35c224f2238d18439C7dBC"
      : "0xB3d8d7887693a9852734b4D25e9C0Bb35Ba8a830";
  }, [chainId]);

  const handleSend = useCallback(() => {
    sendTransaction({
      to: toAddr,
      value: 1n,
    });
  }, [toAddr, sendTransaction]);

  return (
    <>
      <Button
        onClick={handleSend}
        disabled={!isConnected || isSendTxPending}
        isLoading={isSendTxPending}
      >
        Send Transaction (eth)
      </Button>
      {isSendTxError && renderError(sendTxError)}
      {data && (
        <div className="mt-2 text-xs">
          <div>Hash: {truncateAddress(data)}</div>
          <div>
            Status:{" "}
            {isConfirming
              ? "Confirming..."
              : isConfirmed
              ? "Confirmed!"
              : "Pending"}
          </div>
        </div>
      )}
    </>
  );
}

function SignIn() {
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signInResult, setSignInResult] = useState<SignInCore.SignInResult>();
  const [signInFailure, setSignInFailure] = useState<string>();
  const { data: session, status } = useSession();

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      setSigningIn(true);
      setSignInFailure(undefined);
      const nonce = await getNonce();
      const result = await sdk.actions.signIn({ nonce });
      setSignInResult(result);

      await signIn("credentials", {
        message: result.message,
        signature: result.signature,
        redirect: false,
      });
    } catch (e) {
      if (e instanceof SignInCore.RejectedByUser) {
        setSignInFailure("Rejected by user");
        return;
      }

      setSignInFailure("Unknown error");
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      setSignInResult(undefined);
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <>
      {status !== "authenticated" && (
        <Button onClick={handleSignIn} disabled={signingIn}>
          Sign In with Farcaster
        </Button>
      )}
      {status === "authenticated" && (
        <Button onClick={handleSignOut} disabled={signingOut}>
          Sign out
        </Button>
      )}
      {session && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 mb-1">Session</div>
          <div className="whitespace-pre text-[#1A1E23] dark:text-white">
            {JSON.stringify(session, null, 2)}
          </div>
        </div>
      )}
      {signInFailure && !signingIn && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
          <div className="whitespace-pre text-[#1A1E23] dark:text-white">{signInFailure}</div>
        </div>
      )}
      {signInResult && !signingIn && (
        <div className="my-2 p-2 text-xs overflow-x-scroll bg-gray-100 rounded-lg font-mono">
          <div className="font-semibold text-gray-500 mb-1">SIWF Result</div>
          <div className="whitespace-pre text-[#1A1E23] dark:text-white">
            {JSON.stringify(signInResult, null, 2)}
          </div>
        </div>
      )}
    </>
  );
}

function ViewProfile() {
  const [fid, setFid] = useState("3");

  return (
    <>
      <div>
        <Label
          className="text-xs font-semibold text-gray-500 mb-1"
          htmlFor="view-profile-fid"
        >
          Fid
        </Label>
        <Input
          id="view-profile-fid"
          type="number"
          value={fid}
          className="mb-2 text-[#1A1E23] dark:text-white font-bold"
          onChange={(e) => {
            setFid(e.target.value);
          }}
          step="1"
          min="1"
        />
      </div>
      <Button
        onClick={() => {
          sdk.actions.viewProfile({ fid: parseInt(fid) });
        }}
      >
        View Profile
      </Button>
    </>
  );
}

const renderError = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection = error.walk(
      (e) => e instanceof UserRejectedRequestError
    );

    if (isUserRejection) {
      return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
    }
  }

  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};

