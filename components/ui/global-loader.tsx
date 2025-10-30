"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load
  useEffect(() => {
    const hide = () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = setTimeout(() => setVisible(false), 150); // smooth fade
    };
    if (document.readyState === "complete") hide();
    else window.addEventListener("load", hide, { once: true });
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      window.removeEventListener("load", hide as any);
    };
  }, []);

  // Route transitions (best-effort for App Router)
  useEffect(() => {
    // Show immediately on path change, hide shortly after next paint
    setVisible(true);
    const id = setTimeout(() => setVisible(false), 350);
    return () => clearTimeout(id);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40">
        <div className="relative w-full h-full animate-[mizuFloat_2.4s_cubic-bezier(0.45,0,0.55,1)_infinite]" style={{ willChange: 'transform' }}>
          <Image
            src="/loader-removedbg.png"
            alt="Mizu Loader"
            fill
            priority
            className="object-contain animate-[mizuPulse_2.2s_ease-in-out_infinite]"
          />
        </div>
        <div className="absolute inset-0 rounded-xl animate-[mizuReveal_1.8s_ease-in-out_infinite]" />
      </div>
      <style jsx global>{`
        @keyframes mizuPulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(56,189,248,0.0)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 24px rgba(56,189,248,0.5)); transform: scale(1.02); }
        }
        @keyframes mizuFloat {
          0% { transform: translateY(0); }
          50% { transform: translateY(12px); }
          100% { transform: translateY(0); }
        }
        @keyframes mizuReveal {
          0% { opacity: 0.35; }
          50% { opacity: 0.85; }
          100% { opacity: 0.35; }
        }
      `}</style>
    </div>
  );
}


