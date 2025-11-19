"use client";

import { useEffect, useState, useCallback } from "react";
import sdk, { type Context, type FrameNotificationDetails, AddFrame } from "@farcaster/frame-sdk";
import { createStore } from "mipd";
import React from "react";

interface FrameContextType {
  isSDKLoaded: boolean;
  context: Context.FrameContext | undefined;
  added: boolean;
  notificationDetails: FrameNotificationDetails | null;
  lastEvent: string;
  addFrame: () => Promise<void>;
  addFrameResult: string;
}

const FrameContext = React.createContext<FrameContextType | undefined>(undefined);

export function useFrame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [added, setAdded] = useState(false);
  const [notificationDetails, setNotificationDetails] = useState<FrameNotificationDetails | null>(null);
  const [lastEvent, setLastEvent] = useState("");
  const [addFrameResult, setAddFrameResult] = useState("");

  const addFrame = useCallback(async () => {
    try {
      setNotificationDetails(null);

      const result = await sdk.actions.addFrame();

      if (result.notificationDetails) {
        setNotificationDetails(result.notificationDetails);
      }
      setAddFrameResult(
        result.notificationDetails
          ? `Added, got notification token ${result.notificationDetails.token} and url ${result.notificationDetails.url}`
          : "Added, got no notification details"
      );
    } catch (error) {
      if (error instanceof AddFrame.RejectedByUser) {
        setAddFrameResult(`Not added: ${error.message}`);
        return;
      }

      if (error instanceof AddFrame.InvalidDomainManifest) {
        setAddFrameResult(`Not added: ${error.message}`);
        return;
      }

      setAddFrameResult(`Error: ${error}`);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        console.log("Starting SDK initialization...");

        // Get context first
        const context = await sdk.context;
        setContext(context);
        console.log("Context loaded:", context);

        // Check if already added
        if (context?.client?.added) {
          setAdded(true);
        }

        // Set up event listeners
        sdk.on("frameAdded", ({ notificationDetails }) => {
          console.log("Frame added", notificationDetails);
          setAdded(true);
          setNotificationDetails(notificationDetails ?? null);
          setLastEvent("Frame added");
        });

        sdk.on("frameAddRejected", ({ reason }) => {
          console.log("Frame add rejected", reason);
          setAdded(false);
          setLastEvent(`Frame add rejected: ${reason}`);
        });

        sdk.on("frameRemoved", () => {
          console.log("Frame removed");
          setAdded(false);
          setLastEvent("Frame removed");
        });

        sdk.on("notificationsEnabled", ({ notificationDetails }) => {
          console.log("Notifications enabled", notificationDetails);
          setNotificationDetails(notificationDetails ?? null);
          setLastEvent("Notifications enabled");
        });

        sdk.on("notificationsDisabled", () => {
          console.log("Notifications disabled");
          setNotificationDetails(null);
          setLastEvent("Notifications disabled");
        });

        sdk.on("primaryButtonClicked", () => {
          console.log("Primary button clicked");
          setLastEvent("Primary button clicked");
        });

        // Call ready action BEFORE setting SDK as loaded
        console.log("Calling sdk.actions.ready()...");
        await sdk.actions.ready({});
        console.log("✓ Ready action completed successfully - splash screen should be dismissed");

        // Set up MIPD Store
        const store = createStore();
        store.subscribe((providerDetails) => {
          console.log("PROVIDER DETAILS", providerDetails);
        });

        // Now mark as loaded
        setIsSDKLoaded(true);
        console.log("✓ SDK fully initialized");
      } catch (error) {
        console.error("Error initializing SDK:", error);
        // Still mark as loaded to prevent blocking the UI
        setIsSDKLoaded(true);
      }
    };

    if (sdk && !isSDKLoaded) {
      load();
      return () => {
        sdk.removeAllListeners();
      };
    }
  }, [isSDKLoaded]);

  return { isSDKLoaded, context, added, notificationDetails, lastEvent, addFrame, addFrameResult };
}

export function FrameProvider({ children }: { children: React.ReactNode }) {
  const frameState = useFrame();

  if (!frameState.isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <FrameContext.Provider value={frameState}>
      {children}
    </FrameContext.Provider>
  );
}

export function useFrameContext() {
  const context = React.useContext(FrameContext);
  if (context === undefined) {
    throw new Error("useFrameContext must be used within a FrameProvider");
  }
  return context;
} 