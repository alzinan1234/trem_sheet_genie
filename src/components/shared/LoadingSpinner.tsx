import React from 'react';

export function LoadingSpinner({ size = 'md', text = '' }: { size?: 'sm' | 'md' | 'lg'; text?: string }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className={`${sizes[size]} border-2 border-[#2D60FF]/20 border-t-[#2D60FF] rounded-full animate-spin`} />
      {text && <p className="text-sm text-gray-500 font-medium">{text}</p>}
    </div>
  );
}

export function PageLoader({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-gray-100 rounded-full" />
        </td>
      ))}
    </tr>
  );
}
