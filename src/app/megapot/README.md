# MegaPot Module

This module handles all lottery-related functionality for BTB Finance.

## Features

- Purchase lottery tickets using BTB tokens
- Create recurring lottery subscriptions
- Cancel active subscriptions
- View ticket history (coming soon)

## Usage

```tsx
import { MegaPotModule } from "~/app/megapot";

function YourComponent() {
  return (
    <div>
      <h1>BTB Finance Lottery</h1>
      <MegaPotModule />
    </div>
  );
}
```

## Advanced Usage with Custom Hook

You can also use the `useMegaPot` hook directly to create custom interfaces:

```tsx
import { useMegaPot } from "~/app/megapot";

function CustomLotteryComponent() {
  const { 
    purchaseTickets, 
    createSubscription, 
    cancelSubscription,
    isProcessing, 
    txMessage 
  } = useMegaPot();

  return (
    <div>
      <button onClick={() => purchaseTickets("5")}>
        Buy 5 Tickets
      </button>
      
      {isProcessing && <p>Processing transaction...</p>}
      {txMessage && <p>{txMessage}</p>}
    </div>
  );
}
```

## Contract Information

- Lottery Contract Address: `0x92C1fce71847cd68a794A3377741b372F392b25a`
- Network: Base

## Files

- `MegaPotModule.tsx`: Main React component for lottery UI
- `useMegaPot.ts`: Hook for lottery functionality
- `constants.ts`: Contract addresses and default values
- `lotteryabi.json`: ABI for interacting with the lottery contract 