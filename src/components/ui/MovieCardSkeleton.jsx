import React from 'react';

function MovieCardSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-xl bg-[#2A1F25] p-3 flex flex-col justify-end overflow-hidden">
      <div className="space-y-2">
        <div className="h-4 w-3/4 skeleton-loader rounded"></div>
        <div className="flex gap-2">
          <div className="h-3 w-8 skeleton-loader rounded"></div>
          <div className="h-3 w-8 skeleton-loader rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(MovieCardSkeleton);
