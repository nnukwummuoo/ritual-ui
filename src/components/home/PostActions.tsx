"use client";
import React from "react";
import { useUserId } from "@/lib/hooks/useUserId";
import { toast } from "material-react-toastify";
import { useRouter } from 'next/navigation';
import { deletesinglepost } from "@/store/post";
import Image from "next/image";
// Star icons will be referenced directly in the Image components

export type PostActionsProps = {
  starred?: boolean;
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  onStar?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  className?: string;
  post: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  isLiking?: boolean;
};
const iconBase = "h-8 w-8 text-slate-400 hover:text-white cursor-pointer transition-colors duration-200";

function StarIconComponent({ filled }: { filled?: boolean }) {
  return filled ? (
    <Image src="/icons/current-filled-start-icon.png" alt="star filled" width={28} height={28} className="w-8 h-8 object-cover" />
  ) : (
    <Image src="/icons/current-start-icon.png" alt="star outline" width={28} height={28} className="w-8 h-8 object-cover" />
  );
}

function HeartIconComponent({ filled }: { filled?: boolean }) {
  return filled ? (
    <Image src="/icons/current-filled-heart-icon.png" alt="heart filled" width={28} height={28} className="w-8 h-8 object-cover" />
  ) : (
    <Image src="/icons/current-heart-icon.png" alt="heart outline" width={28} height={28} className="w-7 h-7 object-cover" />
  );
}

function CommentIconComponent() {
  return (
    <Image src="/icons/current-comment-icon.png" alt="comment" width={28} height={28} className="w-7 h-7" />
  );
}



function DotsIcon({ post }: { post: any }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const router = useRouter();
  const [hasPop, setHasPop] = React.useState(false);
  const userid = useUserId();
  
  // Check multiple possible user ID fields in the post
  const postUserId = post?.user?._id || post?.userid || post?.user?.userid || post?.userId;
  const own = userid && postUserId && String(userid) === String(postUserId);
  
  return (<>
    {hasPop ? <div className="d-flex fixed bg-[#0e0e0e80] top-0 h-[100dvh] bottom-0 left-0 right-0" onClick={() => { 
        setHasPop(false);
      }}>
      <div className="bg-gray-800 text-white p-4 rounded shadow-lg mt-[25vh] right-4 top-12 z-10 mx-auto my-auto min-w-[240px] max-w-[280px]" style={{
      
      }} >
        <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded" onClick={async() => {
          try {
            await navigator.share({
              title: post?.user?.nickname+"'s post",
              text: post?.content?.slice(0, 100) + (post?.content?.length > 100 ? '...' : ''),
              url: window.location.origin + `/post/${post._id}`
            });
          } catch (error) {
            console.log("Share failed:", error);
          }
          setHasPop(false);
        }}>Share</div>
        <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded" onClick={() => {
          navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`); 
          setHasPop(false);
          toast.success("Link copied to clipboard");
        }}>Copy Link</div>
      {own&&<>
        <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded" onClick={() => { setHasPop(false); router.push(`/post/${post?._id}/edit`) }}>Edit Post</div>

          <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded text-red-500" onClick={async () => {
            const tst=toast.loading("Deleting")
            try {
               setHasPop(false);
            await deletesinglepost(post?._id);
            router.push("/");
            } catch (err) {
              console.error(err);
              toast.error("Error deleting post");
          }finally{
              toast.dismiss(tst)
          }
          }}>Delete Post</div>          
      </>}
    </div>
    </div>
    :<></>}
    <Image 
      src="/icons/current-3-dot-icon.png" 
      alt="more options" 
      width={28} 
      height={28} 
      className={iconBase} 
      onClick={() => { 
        setHasPop(!hasPop);
      }}
    />
    </>
  );
}

export default function PostActions({
  starred,
  liked,
  likeCount = 0,
  commentCount = 0,
  post,
  onStar,
  onLike,
  onComment,
  className = "",
  isLiking = false,
}: PostActionsProps) {
  return (
    <div className={`flex items-center justify-between text-gray-200 ${className}`}>
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50 transition-colors duration-200 ${
          starred ? 'text-white' : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={onStar}
        aria-label={starred ? "Unfollow" : "Follow"}
        aria-pressed={!!starred}
      >
        <StarIconComponent filled={starred} />
        {/* <span className="text-sm">{starred ? "Following" : "Follow"}</span> */}
      </button>

      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50 transition-colors duration-200 ${
          liked ? 'text-white' : 'text-gray-400 hover:text-gray-200'
        }`}
        onClick={() => {
          if (onLike) onLike();
        }}
        disabled={isLiking}
        aria-label={liked ? "Unlike post" : "Like post"}
        aria-pressed={liked}
      >
        <HeartIconComponent filled={liked} />
        <span className="text-sm tabular-nums">{likeCount}</span>
        {isLiking && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </button>

      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50 transition-colors duration-200 text-gray-400 hover:text-gray-200"
        onClick={onComment}
        aria-label="Comment"
      >
        <CommentIconComponent />
        <span className="text-sm tabular-nums">{commentCount}</span>
      </button>

      <button
        type="button"
        className="ml-auto px-3 py-2 rounded hover:bg-gray-700/50 transition-colors duration-200 text-gray-400 hover:text-gray-200"
        onClick={() => {
          // The DotsIcon component handles its own click events
        }}
        aria-label="More options"
      >
        <DotsIcon post={ post } />
      </button>
    </div>
  );
}