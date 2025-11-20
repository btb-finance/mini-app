'use client';

import { useState } from 'react';
import sdk from '@farcaster/frame-sdk';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  color: string;
}

interface BottomNavProps {
  items: NavItem[];
  activeItem: string;
  onItemClick: (id: string) => void;
}

export function BottomNav({ items, activeItem, onItemClick }: BottomNavProps) {
  const [rippleEffect, setRippleEffect] = useState<{ x: number; y: number; show: boolean }>({
    x: 0,
    y: 0,
    show: false
  });

  const handleClick = async (id: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setRippleEffect({ x, y, show: true });
    setTimeout(() => setRippleEffect({ x: 0, y: 0, show: false }), 600);

    // Add haptic feedback for native-like feel
    try {
      await (sdk.actions as any).haptic('light');
    } catch (e) {
      // Haptic feedback not supported, silently fail
    }

    onItemClick(id);
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 px-4 pb-safe">
      <div className="relative mx-auto max-w-md">
        {/* Floating Glass Pill Container */}
        <div className="relative bg-black/60 backdrop-blur-2xl rounded-full border border-white/10 shadow-2xl overflow-hidden">

          {/* Ambient Glow behind the bar */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-xl opacity-50" />

          <nav className="relative px-2 py-2">
            <div className="flex justify-between items-center">
              {items.map((item, index) => {
                const isActive = activeItem === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={(e) => handleClick(item.id, e)}
                    className={`relative flex flex-col items-center justify-center w-full py-2 rounded-full transition-all duration-300 ${isActive
                      ? 'flex-grow-[1.5]'
                      : 'flex-grow hover:bg-white/5'
                      }`}
                  >
                    {/* Active Spotlight Glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-full" />
                    )}

                    {/* Active Indicator Background */}
                    {isActive && (
                      <div
                        className="absolute inset-x-2 top-1 bottom-1 rounded-full opacity-20 blur-md transition-all duration-300"
                        style={{ backgroundColor: item.color }}
                      />
                    )}

                    {/* Ripple effect */}
                    {rippleEffect.show && isActive && (
                      <span
                        className="absolute rounded-full bg-white/30 dark:bg-gray-700/30 animate-ping"
                        style={{
                          left: rippleEffect.x,
                          top: rippleEffect.y,
                          width: '20px',
                          height: '20px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    )}

                    {/* Icon container */}
                    <div className="relative z-10 mb-0.5">
                      <div
                        className={`text-2xl transition-all duration-300 ${isActive
                          ? 'transform -translate-y-1 scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                          : 'opacity-60 grayscale-[0.5] scale-90'
                          }`}
                      >
                        {item.icon}
                      </div>

                      {/* Badge */}
                      {item.badge && (
                        <span
                          className="absolute -top-2 -right-2 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-lg animate-pulse z-20"
                          style={{
                            background: `linear-gradient(135deg, ${item.color} 0%, ${item.color}dd 100%)`,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <span
                      className={`text-[10px] font-bold tracking-wide transition-all duration-300 ${isActive
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-70 translate-y-0 text-gray-400'
                        }`}
                      style={{
                        color: isActive ? item.color : '#9CA3AF',
                        textShadow: isActive ? `0 0 10px ${item.color}40` : '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    >
                      {item.label}
                    </span>

                    {/* Active Dot */}
                    {isActive && (
                      <div
                        className="absolute -bottom-1 w-1 h-1 rounded-full shadow-[0_0_5px_currentColor]"
                        style={{ backgroundColor: item.color }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
