import React from 'react'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'

export default function PostSkeleton() {
  return (
    <SkeletonTheme baseColor="#374151" highlightColor="#4B5563">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3"
          >
            {/* Profile Section */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Skeleton circle={true} width={40} height={40} />
                <div>
                  <Skeleton width={120} height={16} />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
            </div>

            {/* Time */}
            <Skeleton width={60} height={12} className="mb-3" />

            {/* Post Content */}
            <div className="my-2">
              <Skeleton width="100%" height={16} className="mb-2" />
              <Skeleton width="80%" height={16} className="mb-2" />
              <Skeleton width="60%" height={16} />
            </div>

            {/* Image/Video Placeholder */}
            <Skeleton
              width="100%"
              height={300}
              className="rounded-md mb-3"
            />

            {/* Post Actions */}
            <div className="border-t border-gray-700 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Skeleton width={20} height={20} />
                    <Skeleton width={30} height={16} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton width={20} height={20} />
                    <Skeleton width={30} height={16} />
                  </div>
                </div>
                <Skeleton width={20} height={20} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  )
}
