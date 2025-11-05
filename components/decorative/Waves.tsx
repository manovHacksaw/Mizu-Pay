export function Waves() {
  return (
    <div className="absolute bottom-0 left-0 w-full h-[100px] wave-container pointer-events-none">
      <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
        {/* First Wave - Lower with reduced height */}
        <path d="M0,5 Q300,25 600,15 T1200,10 L1200,120 L0,120 Z" className="wave-fill-1" opacity="0.05">
          <animate
            attributeName="d"
            dur="20s"
            repeatCount="indefinite"
            values="
              M0,5 Q300,25 600,15 T1200,10 L1200,120 L0,120 Z;
              M0,35 Q300,8 600,45 T1200,15 L1200,120 L0,120 Z;
              M0,55 Q300,15 600,5 T1200,48 L1200,120 L0,120 Z;
              M0,28 Q300,50 600,22 T1200,35 L1200,120 L0,120 Z;
              M0,5 Q300,25 600,15 T1200,10 L1200,120 L0,120 Z
            "
          />
        </path>
        {/* Second Wave - Higher, moves OPPOSITE to first wave */}
        <path d="M0,80 Q300,45 600,65 T1200,60 L1200,120 L0,120 Z" className="wave-fill-2" opacity="0.1">
          <animate
            attributeName="d"
            dur="20s"
            repeatCount="indefinite"
            values="
              M0,80 Q300,45 600,65 T1200,60 L1200,120 L0,120 Z;
              M0,35 Q300,75 600,25 T1200,70 L1200,120 L0,120 Z;
              M0,15 Q300,50 600,80 T1200,30 L1200,120 L0,120 Z;
              M0,50 Q300,20 600,15 T1200,75 L1200,120 L0,120 Z;
              M0,80 Q300,45 600,65 T1200,60 L1200,120 L0,120 Z
            "
          />
        </path>
      </svg>
    </div>
  );
}

