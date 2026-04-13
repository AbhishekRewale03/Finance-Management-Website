export function DotLoader({
  size = 8,
  gap = 6,
  className = "",
}: {
  size?: number;
  gap?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ gap: `${gap}px` }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="rounded-full bg-current animate-bounce"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}