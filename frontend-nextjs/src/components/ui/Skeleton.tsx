import { memo } from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton = memo(function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  count = 1,
}: SkeletonProps) {
  const skeletons = Array.from({ length: count }, (_, i) => i);

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  return (
    <>
      {skeletons.map((index) => (
        <div
          key={index}
          className={clsx(
            'skeleton animate-pulse',
            variantClasses[variant],
            className
          )}
          style={{
            width: width || (variant === 'circular' ? height : '100%'),
            height: height || (variant === 'text' ? '1rem' : '100%'),
          }}
        />
      ))}
    </>
  );
});

// Pre-built skeleton patterns
export const CardSkeleton = memo(function CardSkeleton() {
  return (
    <div className="card-hover p-6 space-y-4" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px', borderStyle: 'solid', borderRadius: '0.75rem' }}>
      <div className="flex items-center justify-between">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton width={100} height={32} />
      </div>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
    </div>
  );
});

export const ListSkeleton = memo(function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-4 rounded-lg flex items-center gap-4"
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px', borderStyle: 'solid' }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="60%" />
          </div>
          <Skeleton width={80} height={24} />
        </div>
      ))}
    </div>
  );
});

export const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>

      {/* Chart Skeleton */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px', borderStyle: 'solid' }}>
        <Skeleton variant="text" width={200} height={24} className="mb-6" />
        <Skeleton width="100%" height={300} />
      </div>

      {/* List Skeleton */}
      <div className="p-6 rounded-xl" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--border-color)', borderWidth: '1px', borderStyle: 'solid' }}>
        <Skeleton variant="text" width={150} height={24} className="mb-6" />
        <ListSkeleton count={5} />
      </div>
    </div>
  );
});
