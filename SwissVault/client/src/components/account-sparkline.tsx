interface AccountSparklineProps {
  accountId: string;
}

export function AccountSparkline({ accountId }: AccountSparklineProps) {
  // Generate simple sparkline data (mock for visual purposes)
  const data = Array.from({ length: 20 }, (_, i) => {
    const base = 50 + Math.sin(i / 3) * 20;
    const noise = Math.random() * 10;
    return base + noise;
  });

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="h-12 w-full opacity-40">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
