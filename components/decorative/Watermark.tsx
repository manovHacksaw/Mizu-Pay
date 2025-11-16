export function Watermark({ instant = false }: { instant?: boolean }) {
  return (
    <div className={`${instant ? '' : 'animate-watermark'} absolute bottom-[-80px] left-1/2 transform -translate-x-1/2 text-[200px] md:text-[220px] lg:text-[240px] font-bold watermark leading-none tracking-[-10px] whitespace-nowrap pointer-events-none select-none z-0`}>
      MIZU PAY
    </div>
  );
}

