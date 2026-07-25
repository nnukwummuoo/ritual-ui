import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

export default function PostSkeleton() {
  return (
    <SkeletonTheme baseColor="#374151" highlightColor="#4B5563">
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="mx-auto max-w-[30rem] w-full bg-[#111624] rounded-2xl p-3.5"
          >
            {/* Profile Section */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <Skeleton circle={true} width={32} height={32} />
                <div className="flex items-center gap-1.5">
                  <Skeleton width={80} height={14} />
                  <Skeleton width={40} height={12} />
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div className="mb-2.5">
              <Skeleton width="100%" height={14} className="mb-1.5" />
              <Skeleton width="70%" height={14} />
            </div>

            {/* Image/Video Placeholder */}
            <Skeleton
              width="100%"
              height={0}
              containerClassName="block mb-2.5"
              style={{ aspectRatio: 4 / 5, borderRadius: '0.75rem', display: 'block' }}
            />

            {/* Post Actions */}
            <div className="pt-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton width={18} height={18} />
                    <Skeleton width={24} height={14} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={18} height={18} />
                    <Skeleton width={28} height={14} />
                  </div>
                </div>
                <Skeleton width={18} height={18} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}