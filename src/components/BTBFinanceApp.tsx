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
import { useFrameContext } from "~/components/providers/FrameProvider";
import tokenAbi from "../app/token/tokenabi.json";
import { MegaPotModule } from "../app/megapot";
import { NFTModule } from "../app/nft";
import { NFT_PRICE_BTB } from "../app/nft/constants";
import { LarryModule } from "../app/larry";
import { TokenModule } from "../app/token";
import { MiningModule } from "../app/mining";
import { BottomNav, NavItem } from "~/components/ui/BottomNav";
import frameSDK from "@farcaster/frame-sdk";

// BTB Token contract address
const BTB_TOKEN_ADDRESS = "0x888e85C95c84CA41eEf3E4C8C89e8dcE03e41488";

export default function Demo(
  { title }: { title?: string } = { title: "BTB Finance" }
) {
  const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult } = useFrameContext();


  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string>('home');
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

  // Navigation items for bottom menu
  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: '🏠', color: '#3B82F6' },
    { id: 'mining', label: 'Mining', icon: '⛏️', badge: 'HOT', color: '#F59E0B' },
    { id: 'megapot', label: 'Mega Pot', icon: '🎯', badge: '15%', color: '#EF4444' },
    { id: 'token', label: 'Exchange', icon: '💱', color: '#10B981' },
    { id: 'nft', label: 'NFTs', icon: '💎', color: '#8B5CF6' },
    { id: 'larry', label: 'Larry', icon: '🐺', color: '#EC4899' },
  ];

  // Feature handlers
  const handleFeatureClick = async (feature: string) => {
    // Add haptic feedback
    try {
      await (frameSDK.actions as any).haptic('medium');
    } catch (e) {
      // Haptic not supported
    }

    if (feature === 'megapot' || feature === 'nft' || feature === 'larry' || feature === 'token' || feature === 'mining') {
      setIsFullscreen(true);
    }
    setActiveFeature(feature);
  };

  const handleBackFromFullscreen = useCallback(() => {
    setIsFullscreen(false);
    setActiveFeature('home');
  }, []);

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'home':
        return renderHomeContent();
      case 'megapot':
        return (
          <MegaPotModule
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
      case 'token':
        return (
          <TokenModule
            isFullscreen={isFullscreen}
            onBack={handleBackFromFullscreen}
          />
        );
      case 'mining':
        return (
          <MiningModule
            isFullscreen={isFullscreen}
            onBack={handleBackFromFullscreen}
          />
        );
      default:
        return renderHomeContent();
    }
  };

  const renderHomeContent = () => {
    return (
      <div className="space-y-4 pb-4">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl">
          <div className="relative z-10">
            <div className="mb-4 flex items-center justify-center">
              <img src="/images/btb-banner.png" alt="BTB Finance" className="w-full h-32 object-cover rounded-xl shadow-lg" />
            </div>
            <h2 className="text-2xl font-bold text-center mb-2">Welcome to BTB Finance</h2>
            <p className="text-center text-sm text-blue-100 opacity-90">
              Your Gateway to Decentralized Finance
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse" />
        </div>

        {/* Add to Farcaster Button - Only show if not added */}
        {!added && (
          <div className="bg-gray-900/5 border border-gray-200 dark:bg-white/5 dark:border-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Enable Notifications</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Get updates on your earnings</p>
              </div>
              <Button
                onClick={addFrame}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Add to Farcaster
              </Button>
            </div>

          </div>
        )}

        {/* Quick Stats */}
        {isConnected && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
              <span className="mr-2">💼</span>
              Your Portfolio
            </h3>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 mb-3">
              <div className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">BTB Balance</div>
              <div className="flex items-end">
                <span className="text-3xl font-bold text-gray-800 dark:text-white">{parseFloat(tokenBalance).toFixed(2)}</span>
                <span className="ml-2 text-sm font-semibold text-blue-600 dark:text-blue-400">BTB</span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Wallet Address</div>
              <div className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {address ? address.slice(0, 10) + '...' + address.slice(-8) : ''}
              </div>
            </div>

            <Button
              onClick={() => disconnect()}
              className="w-full mt-4 py-2.5 text-sm bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Disconnect Wallet
            </Button>
          </div>
        )}

        {/* Features Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-5 border border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
            <span className="mr-2">🚀</span>
            Explore Features
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {navItems.filter(item => item.id !== 'home').map((item) => (
              <button
                key={item.id}
                onClick={() => handleFeatureClick(item.id)}
                className="group relative overflow-hidden rounded-2xl p-4 text-left transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`,
                  border: `1px solid ${item.color}30`,
                }}
              >
                <div className="relative z-10">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1">
                    {item.label}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {item.id === 'megapot' && 'Win big prizes'}
                    {item.id === 'mining' && 'Find the Motherlode'}
                    {item.id === 'token' && 'Buy & Sell BTB'}
                    {item.id === 'nft' && 'Mint NFTs'}
                    {item.id === 'larry' && 'Trade & leverage'}
                  </p>
                  {item.badge && (
                    <span
                      className="absolute top-2 right-2 text-[10px] font-bold text-white px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${item.color}20 0%, ${item.color}30 100%)`,
                  }}
                />
              </button>
            ))}
          </div>
        </div>

      </div>
    );
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div
      style={{
        paddingTop: context?.client.safeAreaInsets?.top ?? 0,
        paddingBottom: (context?.client.safeAreaInsets?.bottom ?? 0) + 80,
        paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
        paddingRight: context?.client.safeAreaInsets?.right ?? 0,
      }}
      className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black min-h-screen"
    >
      <div className="w-full max-w-md mx-auto py-4 px-3">
        {/* App title - only show when not connected and not in fullscreen */}
        {!isConnected && activeFeature === 'home' && (
          <div className="text-center mb-6">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mb-2">
              {title}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Decentralized Finance Ecosystem
            </p>
          </div>
        )}

        {/* Connect wallet screen - show when not connected */}
        {!isConnected && activeFeature === 'home' && (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-100 dark:border-gray-700 max-w-sm w-full">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative">
                  <img src="/logo.avif" alt="BTB Finance Logo" className="h-24 w-24 object-contain drop-shadow-2xl" />
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-20 blur-xl animate-pulse" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 text-center">
                Welcome Back!
              </h2>
              <p className="mb-6 text-sm text-gray-600 dark:text-gray-300 leading-relaxed text-center">
                Connect your wallet to access all BTB Finance features
              </p>
              <Button
                onClick={() => connect({ connector: config.connectors[0] })}
                className="w-full py-4 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95"
              >
                <span className="mr-2">🔗</span>
                Connect Wallet
              </Button>
            </div>
          </div>
        )}

        {/* Feature Content - show when connected or when viewing a feature */}
        {(isConnected || activeFeature !== 'home') && renderFeatureContent()}
      </div>

      {/* Bottom Navigation - always visible when connected */}
      {isConnected && (
        <BottomNav
          items={navItems}
          activeItem={activeFeature}
          onItemClick={handleFeatureClick}
        />
      )}
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

