"use client";

/**
 * Skeleton loading components con shimmer effect viola.
 * Usati mentre i dati sono in caricamento.
 */

const shimmerStyle: React.CSSProperties = {
  background:
    "linear-gradient(90deg, rgba(168,139,250,0.05) 0%, rgba(168,139,250,0.15) 50%, rgba(168,139,250,0.05) 100%)",
  backgroundSize: "200% 100%",
  animation: "skeleton-shimmer 1.5s ease-in-out infinite",
};

export function SkeletonLine({
  width = "100%",
  height = 12,
  className = "",
}: {
  width?: string | number;
  height?: number;
  className?: string;
}) {
  return (
    <>
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div
        className={`rounded-full ${className}`}
        style={{ ...shimmerStyle, width, height }}
      />
    </>
  );
}

export function SkeletonCard({
  height = 80,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[14px] ${className}`}
      style={{ ...shimmerStyle, height }}
    />
  );
}

export function SkeletonTransactionRow({ isLast = false }: { isLast?: boolean }) {
  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? "border-b border-white/[0.04]" : ""}`}
    >
      {/* Icona */}
      <div
        className="h-10 w-10 flex-shrink-0 rounded-[12px]"
        style={shimmerStyle}
      />

      <div className="flex-1 space-y-2">
        {/* Merchant */}
        <SkeletonLine width="45%" height={13} />
        {/* Category + date */}
        <SkeletonLine width="30%" height={10} />
      </div>

      {/* Importo */}
      <SkeletonLine width={52} height={13} />
    </div>
  );
}
