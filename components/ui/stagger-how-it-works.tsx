"use client"

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const SQRT_5000 = Math.sqrt(5000);

const allSteps = [
  {
    tempId: 0,
    number: "01",
    title: "Checkout with Mizu Pay",
    description: "When you're shopping on your favorite e-commerce site (like Amazon, Flipkart, or Myntra), choose \"Pay with Crypto (via Mizu Pay)\" during checkout. Our browser extension detects the purchase and opens the Mizu Pay payment page automatically.",
  },
  {
    tempId: 1,
    number: "02",
    title: "Quick Login & Authentication",
    description: "If you're new to Mizu Pay, simply log in using your email — no complex wallet setup required. Returning users are recognized instantly.",
  },
  {
    tempId: 2,
    number: "03",
    title: "Choose Your Wallet",
    description: "Select how you want to pay: Mizu Pay Wallet (embedded wallet managed by Privy — ideal for beginners) or your existing crypto wallet (for regular Web3 users). You can pay using CELO or cUSD/USDC directly.",
  },
  {
    tempId: 3,
    number: "04",
    title: "Smart Price Match",
    description: "Mizu Pay automatically finds the closest gift card value matching your purchase amount (e.g., ₹750 → ₹1000 gift card). You'll see the final payable amount before confirming.",
  },
  {
    tempId: 4,
    number: "05",
    title: "Secure On-Chain Payment",
    description: "Click Pay, confirm the transaction in your wallet, and your payment is processed on-chain. Every payment is transparent and traceable — no middlemen.",
  },
  {
    tempId: 5,
    number: "06",
    title: "Blockchain Validation",
    description: "Mizu Pay's backend verifies your payment using blockchain events to ensure: The correct wallet and amount, and the right currency. Once validated, your payment is marked as successful.",
  },
  {
    tempId: 6,
    number: "07",
    title: "Instant Gift Card Delivery",
    description: "After successful payment, a gift card code is automatically requested from our partner provider. It's stored securely and delivered to you via email and your dashboard.",
  },
  {
    tempId: 7,
    number: "08",
    title: "Dashboard & History",
    description: "Track all your purchases easily from the Mizu Pay Dashboard: View active wallet balance, see past transactions and timestamps, and access gift card details and redemption info.",
  },
];

// Initialize with step 1 in the center (position 0)
// For 8 items (even), center is at index 4 (position = 4 - 8/2 = 0)
const initialSteps = [
  ...allSteps.slice(4), // Steps 05-08
  ...allSteps.slice(0, 4), // Steps 01-04
];

interface StepCardProps {
  position: number;
  step: typeof allSteps[0];
  handleMove: (steps: number) => void;
  cardSize: number;
}

const StepCard: React.FC<StepCardProps> = ({ 
  position, 
  step, 
  handleMove, 
  cardSize 
}) => {
  const isCenter = position === 0;

  return (
    <div
      onClick={() => handleMove(position)}
      className={cn(
        "absolute left-1/2 top-1/2 cursor-pointer border-2 p-8 transition-all duration-500 ease-in-out",
        isCenter 
          ? "z-10 bg-primary text-primary-foreground border-primary" 
          : "z-0 bg-card text-card-foreground border-border hover:border-primary/50"
      )}
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(50px 0%, calc(100% - 50px) 0%, 100% 50px, 100% 100%, calc(100% - 50px) 100%, 50px 100%, 0 100%, 0 0)`,
        transform: `
          translate(-50%, -50%) 
          translateX(${(cardSize / 1.5) * position}px)
          translateY(${isCenter ? -65 : position % 2 ? 15 : -15}px)
          rotate(${isCenter ? 0 : position % 2 ? 2.5 : -2.5}deg)
        `,
        boxShadow: isCenter ? "0px 8px 0px 4px rgb(var(--border))" : "0px 0px 0px 0px transparent"
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-border"
        style={{
          right: -2,
          top: 48,
          width: SQRT_5000,
          height: 2
        }}
      />
      <div className="mb-4">
        <span className={cn(
          "text-2xl font-bold",
          isCenter ? "text-primary-foreground" : "text-foreground"
        )}>
          {step.number}
        </span>
      </div>
      <h3 className={cn(
        "text-base sm:text-xl font-medium mb-2",
        isCenter ? "text-primary-foreground" : "text-foreground"
      )}>
        {step.title}
      </h3>
      <p className={cn(
        "text-sm leading-relaxed",
        isCenter ? "text-primary-foreground/90" : "text-muted-foreground"
      )}>
        {step.description}
      </p>
    </div>
  );
};

export const StaggerHowItWorks: React.FC = () => {
  const [cardSize, setCardSize] = useState(365);
  // Initialize with step 1 in the center
  const [stepsList, setStepsList] = useState(() => initialSteps);

  const handleMove = (steps: number) => {
    const newList = [...stepsList];
    if (steps > 0) {
      for (let i = steps; i > 0; i--) {
        const item = newList.shift();
        if (!item) return;
        newList.push({ ...item, tempId: Math.random() });
      }
    } else {
      for (let i = steps; i < 0; i++) {
        const item = newList.pop();
        if (!item) return;
        newList.unshift({ ...item, tempId: Math.random() });
      }
    }
    setStepsList(newList);
  };

  useEffect(() => {
    const updateSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");
      setCardSize(matches ? 365 : 290);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div
      className="relative w-full overflow-hidden bg-muted/30"
      style={{ height: 600 }}
    >
      {stepsList.map((step, index) => {
        const position = stepsList.length % 2
          ? index - (stepsList.length + 1) / 2
          : index - stepsList.length / 2;
        return (
          <StepCard
            key={step.tempId}
            step={step}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        <button
          onClick={() => handleMove(-1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Previous step"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className={cn(
            "flex h-14 w-14 items-center justify-center text-2xl transition-colors",
            "bg-background border-2 border-border hover:bg-primary hover:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
          aria-label="Next step"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
};

