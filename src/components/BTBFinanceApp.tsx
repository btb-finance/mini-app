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

// BTB Token contract address
const BTB_TOKEN_ADDRESS = "0xBBF88F780072F5141dE94E0A711bD2ad2c1f83BB";

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
    if (feature === 'megapot' || feature === 'chicks' || feature === 'nft') {
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
      <div className={`${isFullscreen ? 'w-full max-w-md' : 'w-full max-w-[300px]'} mx-auto py-2 px-2`}>
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
          <div className="mb-4 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 mb-3">
              <div className="mb-3 h-16 sm:h-20 flex items-center justify-center">
                <img src="/btb-logo.png" alt="BTB Finance Logo" className="h-16 w-16 object-contain" />
              </div>
              <p className="mb-3 text-xs text-gray-600 dark:text-gray-300">
                Connect your wallet to access the BTB Finance ecosystem and explore all features.
              </p>
              <Button
                onClick={() => connect({ connector: config.connectors[0] })}
                className="w-full py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl"
              >
                Connect Wallet
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-1 mb-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-md">
                <div className="text-blue-500 dark:text-blue-400 text-lg mb-0.5">10%</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Staking APY</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-md">
                <div className="text-purple-500 dark:text-purple-400 text-lg mb-0.5">5k+</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Holders</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-2 text-center shadow-md">
                <div className="text-green-500 dark:text-green-400 text-lg mb-0.5">3</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Chains</div>
              </div>
            </div>
          </div>
        )}

        {/* Add BTB Token Balance Display - hide when in fullscreen */}
        {isConnected && !isFullscreen && (
          <div className="mb-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Wallet</h2>
                <Button 
                  onClick={() => disconnect()}
                  className="text-xs bg-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white py-1 px-2"
                >
                  Disconnect
                </Button>
              </div>
              
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 mb-2">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Your BTB Balance</div>
                <div className="flex items-end">
                  <span className="text-xl font-bold text-gray-800 dark:text-white">{parseFloat(tokenBalance).toFixed(2)}</span>
                  <span className="ml-1 text-xs text-gray-600 dark:text-gray-300">BTB</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Connected Address</div>
              <div className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate">
                {address ? address.slice(0, 6) + '...' + address.slice(-4) : ''}
              </div>
            </div>
          </div>
        )}
        
        {/* Feature Buttons - hide when in fullscreen */}
        {!isFullscreen && (
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">Explore BTB</h2>
            <div className="grid grid-cols-2 gap-2">
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleFeatureClick('megapot')}
              >
                <div className="h-16 sm:h-20 bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎯</span>
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Mega Pot</h3>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Win big with BTB</p>
                    <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">15% CASHBACK</span>
                  </div>
                </div>
              </div>
              
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                onClick={() => handleFeatureClick('chicks')}
              >
                <div className="h-16 sm:h-20 bg-gradient-to-r from-green-500 to-teal-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🐥</span>
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">Chicks</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Trade & earn with Chicks</p>
                </div>
              </div>
              
              <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 col-span-2"
                onClick={() => handleFeatureClick('nft')}
              >
                <div className="h-16 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🖼️</span>
                </div>
                <div className="p-2">
                  <h3 className="font-bold text-gray-800 dark:text-white text-sm">NFT Collection</h3>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400">Mint BTB NFTs for {NFT_PRICE_BTB} BTB</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Content */}
        {activeFeature && renderFeatureContent()}

        {/* Footer - hide when a feature is active or in fullscreen mode */}
        {!activeFeature && !isFullscreen && (
          <div className="text-center text-[10px] text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-200 dark:border-gray-700">
            <p className="mb-1">© 2023 BTB Finance. All rights reserved.</p>
            <div className="flex justify-center space-x-3 mt-1">
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Twitter</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Telegram</a>
              <a href="#" className="hover:text-gray-700 dark:hover:text-gray-300">Docs</a>
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

