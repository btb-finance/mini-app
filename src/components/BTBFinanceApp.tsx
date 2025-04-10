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

// BTB Token contract address
const BTB_TOKEN_ADDRESS = "0xBBF88F780072F5141dE94E0A711bD2ad2c1f83BB";

export default function Demo(
  { title }: { title?: string } = { title: "BTB Finance" }
) {
  const { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult } = useFrame();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [activeFeature, setActiveFeature] = useState<string | null>(null);

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
    setActiveFeature(feature);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'megapot':
        return (
          <div className="p-4 bg-[#A52A2A]/10 dark:bg-[#8B0000]/20 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Mega Pot</h2>
            <p className="mb-2">Stake your BTB tokens to earn rewards and participate in the weekly prize draw.</p>
            <div className="mb-2">
              <Label htmlFor="stake-amount" className="font-medium mb-1 block">Stake Amount</Label>
              <Input 
                id="stake-amount" 
                type="number" 
                placeholder="Enter amount to stake" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#A52A2A]/50 focus:border-[#A52A2A] font-medium p-2 rounded w-full"
                onChange={(e) => console.log("Stake amount:", e.target.value)}
              />
            </div>
            <Button onClick={() => console.log("Staking not implemented yet")}>Stake BTB</Button>
          </div>
        );
      case 'bridge':
        return (
          <div className="p-4 bg-[#10B981]/10 dark:bg-[#10B981]/20 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Bridge</h2>
            <p className="mb-2">Transfer your BTB tokens between different chains securely.</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label htmlFor="from-chain" className="font-medium mb-1 block">From Chain</Label>
                <select 
                  id="from-chain" 
                  style={{color: '#1A1E23', backgroundColor: 'white'}}
                  className="w-full p-2 rounded border-2 border-[#10B981]/50 focus:border-[#10B981] font-medium"
                  onChange={(e) => console.log("From chain:", e.target.value)}
                >
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="base">Base</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="optimism">Optimism</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="ethereum">Ethereum</option>
                </select>
              </div>
              <div>
                <Label htmlFor="to-chain" className="font-medium mb-1 block">To Chain</Label>
                <select 
                  id="to-chain" 
                  style={{color: '#1A1E23', backgroundColor: 'white'}}
                  className="w-full p-2 rounded border-2 border-[#10B981]/50 focus:border-[#10B981] font-medium"
                  onChange={(e) => console.log("To chain:", e.target.value)}
                >
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="base">Base</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="optimism">Optimism</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="ethereum">Ethereum</option>
                </select>
              </div>
            </div>
            <div className="mb-2">
              <Label htmlFor="bridge-amount" className="font-medium mb-1 block">Amount</Label>
              <Input 
                id="bridge-amount" 
                type="number" 
                placeholder="Enter amount to bridge" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#10B981]/50 focus:border-[#10B981] font-medium p-2 rounded w-full"
                onChange={(e) => console.log("Bridge amount:", e.target.value)}
              />
            </div>
            <Button onClick={() => console.log("Bridge not implemented yet")}>Bridge BTB</Button>
          </div>
        );
      case 'chex':
        return (
          <div className="p-4 bg-[#8B0000]/10 dark:bg-[#8B0000]/20 rounded-lg">
            <h2 className="text-xl font-bold mb-2">BTB Chex</h2>
            <p className="mb-2">Swap BTB tokens for other cryptocurrencies or tokens.</p>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <Label htmlFor="from-token" className="font-medium mb-1 block">From</Label>
                <select 
                  id="from-token" 
                  style={{color: '#1A1E23', backgroundColor: 'white'}}
                  className="w-full p-2 rounded border-2 border-[#8B0000]/50 focus:border-[#8B0000] font-medium"
                  onChange={(e) => console.log("From token:", e.target.value)}
                >
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="btb">BTB</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="eth">ETH</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="usdc">USDC</option>
                </select>
              </div>
              <div>
                <Label htmlFor="to-token" className="font-medium mb-1 block">To</Label>
                <select 
                  id="to-token" 
                  style={{color: '#1A1E23', backgroundColor: 'white'}}
                  className="w-full p-2 rounded border-2 border-[#8B0000]/50 focus:border-[#8B0000] font-medium"
                  onChange={(e) => console.log("To token:", e.target.value)}
                >
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="eth">ETH</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="usdc">USDC</option>
                  <option style={{color: '#1A1E23', backgroundColor: 'white'}} value="btb">BTB</option>
                </select>
              </div>
            </div>
            <div className="mb-2">
              <Label htmlFor="swap-amount" className="font-medium mb-1 block">Amount</Label>
              <Input 
                id="swap-amount" 
                type="number" 
                placeholder="Enter amount to swap" 
                style={{color: 'black', backgroundColor: 'white'}}
                className="border-2 border-[#8B0000]/50 focus:border-[#8B0000] font-medium p-2 rounded w-full"
                onChange={(e) => console.log("Swap amount:", e.target.value)}
              />
            </div>
            <Button onClick={() => console.log("Swap not implemented yet")}>Swap</Button>
          </div>
        );
      case 'nft':
        return (
          <div className="p-4 bg-[#1A1E23]/10 dark:bg-[#1A1E23]/30 rounded-lg">
            <h2 className="text-xl font-bold mb-2">BTB NFTs</h2>
            <p className="mb-2">Explore and mint exclusive BTB NFTs.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2 bg-white dark:bg-gray-800 rounded">
                <div className="bg-gray-200 dark:bg-gray-700 h-24 w-full rounded mb-2"></div>
                <p className="font-bold">BTB Genesis</p>
                <p className="text-sm">Price: 0.1 ETH</p>
                <Button className="mt-2 w-full bg-[#10B981] hover:bg-[#0D876A]" onClick={() => console.log("Mint not implemented yet")}>Mint</Button>
              </div>
              <div className="p-2 bg-white dark:bg-gray-800 rounded">
                <div className="bg-gray-200 dark:bg-gray-700 h-24 w-full rounded mb-2"></div>
                <p className="font-bold">BTB Founder</p>
                <p className="text-sm">Price: 500 BTB</p>
                <Button className="mt-2 w-full bg-[#10B981] hover:bg-[#0D876A]" onClick={() => console.log("Mint not implemented yet")}>Mint</Button>
              </div>
            </div>
          </div>
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
    >
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4">{title}</h1>

        {/* Connect wallet button if not connected */}
        {!isConnected && (
          <div className="mb-4 text-center">
            <p className="mb-2">Connect your wallet to view your BTB balance and use features</p>
            <Button
              onClick={() => connect({ connector: config.connectors[0] })}
              className="btb-gradient hover:btb-gradient-dark"
            >
              Connect Wallet
            </Button>
          </div>
        )}

        {/* Add BTB Token Balance Display */}
        {isConnected && (
          <div className="mb-4 p-4 bg-[#8B0000]/10 dark:bg-[#8B0000]/20 rounded-lg">
            <h2 className="text-xl font-bold mb-2">BTB Token Balance</h2>
            <div className="flex items-center justify-between">
              <span>Balance:</span>
              <span className="font-mono text-lg font-bold">{parseFloat(tokenBalance).toFixed(4)} BTB</span>
            </div>
            <div className="text-right mt-2">
              <Button 
                onClick={() => disconnect()}
                className="text-xs bg-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
        
        {/* Feature Buttons */}
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Button 
            className={`p-3 ${activeFeature === 'megapot' ? 'bg-[#A52A2A]' : ''}`}
            onClick={() => handleFeatureClick('megapot')}
          >
            Mega Pot
          </Button>
          <Button 
            className={`p-3 ${activeFeature === 'bridge' ? 'bg-[#10B981]' : ''}`}
            onClick={() => handleFeatureClick('bridge')}
          >
            Bridge
          </Button>
          <Button 
            className={`p-3 ${activeFeature === 'chex' ? 'bg-[#8B0000]' : ''}`}
            onClick={() => handleFeatureClick('chex')}
          >
            Chex
          </Button>
          <Button 
            className={`p-3 ${activeFeature === 'nft' ? 'bg-[#1A1E23]' : ''}`}
            onClick={() => handleFeatureClick('nft')}
          >
            NFT
          </Button>
        </div>

        {/* Feature Content */}
        {activeFeature && renderFeatureContent()}

        {/* Rest of the original components */}
        {!activeFeature && (
          <>
            <div className="mb-4">
              <h2 className="font-2xl font-bold">Context</h2>
              <button
                onClick={toggleContext}
                className="flex items-center gap-2 transition-colors"
              >
                <span
                  className={`transform transition-transform ${
                    isContextOpen ? "rotate-90" : ""
                  }`}
                >
                  ➤
                </span>
                Tap to expand
              </button>

              {isContextOpen && (
                <div className="p-4 mt-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    {JSON.stringify(context, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div>
              <h2 className="font-2xl font-bold">Actions</h2>

              <div className="mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    sdk.actions.signIn
                  </pre>
                </div>
                <SignIn />
              </div>

              <div className="mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    sdk.actions.openUrl
                  </pre>
                </div>
                <Button onClick={openUrl}>Open Link</Button>
              </div>

              <div className="mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    sdk.actions.openUrl
                  </pre>
                </div>
                <Button onClick={openWarpcastUrl}>Open Warpcast Link</Button>
              </div>

              <div className="mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    sdk.actions.viewProfile
                  </pre>
                </div>
                <ViewProfile />
              </div>

              <div className="mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg my-2">
                  <pre className="font-mono text-xs text-[#1A1E23] dark:text-white whitespace-pre-wrap break-words max-w-[260px] overflow-x-">
                    sdk.actions.close
                  </pre>
                </div>
                <Button onClick={close}>Close Frame</Button>
              </div>
            </div>
          </>
        )}
        
        {/* Back button when a feature is active */}
        {activeFeature && (
          <div className="mt-4">
            <Button onClick={() => setActiveFeature(null)}>← Back to Home</Button>
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

