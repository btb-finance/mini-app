'use client';

import React from 'react';
import { TokenModule } from './TokenModule';

export default function TokenPage() {
    return (
        <div className="min-h-screen w-full bg-background text-foreground p-4 md:p-8 pt-24 pb-24">
            <TokenModule />
        </div>
    );
}
