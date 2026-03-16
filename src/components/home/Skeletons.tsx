// Skeleton component for Creators list
export const CreatorsSkeleton = () => {
    return (
        <div className="w-full">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-20 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Creators grid skeleton */}
            <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="bg-[#111624] rounded-lg p-4 animate-pulse">
                        {/* Avatar skeleton */}
                        <div className="w-20 h-20 bg-gray-700 rounded-full mx-auto mb-3"></div>

                        {/* Name skeleton */}
                        <div className="h-4 w-24 bg-gray-700 rounded mx-auto mb-2"></div>

                        {/* Username skeleton */}
                        <div className="h-3 w-16 bg-gray-700 rounded mx-auto mb-3"></div>

                        {/* Button skeleton */}
                        <div className="h-8 w-full bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Skeleton component for Rituals/Stories
export const RitualsSkeleton = () => {
    return (
        <div className="w-full bg-[#111624] rounded-lg p-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-28 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Stories scroll skeleton */}
            <div className="flex gap-3 overflow-x-hidden">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex-shrink-0 animate-pulse">
                        {/* Story circle skeleton */}
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full p-[2px] mb-2">
                            <div className="w-full h-full bg-[#111624] rounded-full"></div>
                        </div>

                        {/* Story title skeleton */}
                        <div className="h-3 w-16 bg-gray-700 rounded mx-auto"></div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Skeleton component for Top Fans
export const TopFansSkeleton = () => {
    return (
        <div className="w-full bg-[#111624] rounded-lg p-4">
            {/* Header skeleton */}
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-gray-700 rounded animate-pulse"></div>
                <div className="h-5 w-5 bg-gray-700 rounded animate-pulse"></div>
            </div>

            {/* Top 3 fans (larger) skeleton */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col items-center animate-pulse">
                        {/* Rank badge skeleton */}
                        <div className="w-6 h-6 bg-yellow-600 rounded-full mb-2"></div>

                        {/* Avatar skeleton */}
                        <div className="w-16 h-16 bg-gray-700 rounded-full mb-2 relative">
                            {i === 1 && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-yellow-500 rounded"></div>
                            )}
                        </div>

                        {/* Name skeleton */}
                        <div className="h-3 w-16 bg-gray-700 rounded mb-1"></div>

                        {/* Amount skeleton */}
                        <div className="h-3 w-12 bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>

            {/* Remaining fans (smaller) skeleton - 5-5-4 grid */}
            <div className="space-y-2">
                {/* First row - 5 fans */}
                <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center animate-pulse">
                            <div className="w-12 h-12 bg-gray-700 rounded-full mb-1"></div>
                            <div className="h-2 w-10 bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Second row - 5 fans */}
                <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center animate-pulse">
                            <div className="w-12 h-12 bg-gray-700 rounded-full mb-1"></div>
                            <div className="h-2 w-10 bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>

                {/* Third row - 4 fans centered */}
                <div className="grid grid-cols-4 gap-2 max-w-[80%] mx-auto">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex flex-col items-center animate-pulse">
                            <div className="w-12 h-12 bg-gray-700 rounded-full mb-1"></div>
                            <div className="h-2 w-10 bg-gray-700 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// General Post Skeleton (for lazy loading)
export const PostSkeleton = () => {
    return (
        <div className="w-full bg-[#111624] rounded-lg p-4 mb-4 animate-pulse">
            {/* Header with avatar and name */}
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-700 rounded"></div>
                </div>
                <div className="w-8 h-8 bg-gray-700 rounded"></div>
            </div>

            {/* Content text skeleton */}
            <div className="mb-4 space-y-2">
                <div className="h-3 w-full bg-gray-700 rounded"></div>
                <div className="h-3 w-4/5 bg-gray-700 rounded"></div>
            </div>

            {/* Media skeleton (4:5 aspect ratio) */}
            <div className="w-full aspect-[4/5] bg-gray-700 rounded mb-4"></div>

            {/* Action buttons skeleton */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <div className="h-3 w-8 bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                    <div className="h-3 w-8 bg-gray-700 rounded"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-700 rounded-full"></div>
                </div>
            </div>
        </div>
    );
};
