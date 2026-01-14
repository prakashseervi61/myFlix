import React from 'react';

function MovieCardSkeleton() {
  return (
    <div className="w-full aspect-[2/3] rounded-lg sm:rounded-xl bg-gray-800/50 overflow-hidden relative isolate">
       <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>
       <div className="absolute bottom-0 w-full p-2 sm:p-3 space-y-1.5 sm:space-y-2">
         <div className="h-3 sm:h-4 w-3/4 bg-gray-700/50 rounded"></div>
         <div className="flex gap-1.5 sm:gap-2">
           <div className="h-2.5 sm:h-3 w-8 bg-gray-700/50 rounded"></div>
           <div className="h-2.5 sm:h-3 w-8 bg-gray-700/50 rounded"></div>
         </div>
       </div>
    </div>
  );
}

export default React.memo(MovieCardSkeleton);
