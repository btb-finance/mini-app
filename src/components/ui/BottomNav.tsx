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
      await sdk.actions.haptic('light');
    } catch (e) {
      // Haptic feedback not supported, silently fail
    }

    onItemClick(id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="relative mx-auto max-w-md">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/80 dark:from-gray-900/95 dark:via-gray-900/90 dark:to-gray-900/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 shadow-2xl" />

        {/* Active indicator gradient background */}
        <div className="absolute -top-px inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <nav className="relative px-2 pt-2 pb-3">
          <div className="flex justify-around items-center">
            {items.map((item, index) => {
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  onClick={(e) => handleClick(item.id, e)}
                  className={`relative flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-2xl transition-all duration-300 transform ${
                    isActive
                      ? 'scale-105'
                      : 'scale-100 hover:scale-105 active:scale-95'
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Active background with gradient */}
                  {isActive && (
                    <div
                      className="absolute inset-0 rounded-2xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, ${item.color}15 0%, ${item.color}25 100%)`,
                      }}
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
                  <div className="relative mb-1">
                    <div
                      className={`text-2xl transition-all duration-300 ${
                        isActive
                          ? 'transform -translate-y-0.5 drop-shadow-lg'
                          : 'opacity-70'
                      }`}
                    >
                      {item.icon}
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <span
                        className="absolute -top-1 -right-1 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-full shadow-lg animate-pulse"
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
                    className={`text-[10px] font-semibold transition-all duration-300 ${
                      isActive
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-60 translate-y-0.5'
                    }`}
                    style={{
                      color: isActive ? item.color : undefined,
                    }}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator dot */}
                  {isActive && (
                    <div
                      className="absolute -bottom-1 w-1 h-1 rounded-full shadow-lg animate-pulse"
                      style={{
                        backgroundColor: item.color,
                        boxShadow: `0 0 8px ${item.color}`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
