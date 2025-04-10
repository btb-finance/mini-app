"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChicksModule } from "./ChicksModule";

export default function ChicksPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const router = useRouter();

  const handleBack = () => {
    if (isFullscreen) {
      setIsFullscreen(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center w-full">
        <h1 className="text-2xl font-bold mb-4">Chicks Finance</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
          Buy, sell, and leverage Chicks tokens
        </p>
        
        <ChicksModule 
          isFullscreen={isFullscreen} 
          onBack={handleBack} 
          className="max-w-md w-full"
        />
        
        {!isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="mt-4 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            View in fullscreen
          </button>
        )}
      </main>
    </div>
  );
} 