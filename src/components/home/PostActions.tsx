"use client";
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useUserId } from "@/lib/hooks/useUserId";
import { toast } from "material-react-toastify";
import { useRouter } from 'next/navigation';
import { deletesinglepost } from "@/store/post";
import Image from "next/image";
import StarIcon from "@/icons/transparentstar.svg";
import StarIcon2 from "@/icons/star.svg";
import { MessageCircleIcon } from "lucide-react";
import { HeartIcon } from "lucide-react";

export type PostActionsProps = {
  starred?: boolean;
  liked?: boolean;
  likeCount?: number;
  commentCount?: number;
  onStar?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onMore?: () => void;
  className?: string;
  post: any;
  isLiking?: boolean;
};
const iconBase1 = "size-6";
const iconBase = "h-10 w-10 text-slate-400 hover:text-white cursor-pointer transition-colors duration-200";

function StarIconComponent({ filled }: { filled?: boolean }) {
  return filled ? (
    <Image src={StarIcon2} alt="star filled" width={24} height={24} className={iconBase1} />
  ) : (
    <Image src={StarIcon} alt="star outline" width={24} height={24} className={iconBase1} />
  );
}

// function HeartIcon({ filled }: { filled?: boolean }) {
//   return (
//     <svg
//       xmlns="http://www.w3.org/2000/svg"
//       viewBox="0 0 24 24"
//       fill={filled ? "currentColor" : "none"}
//       stroke={filled ? "none" : "currentColor"}
//       strokeWidth={1.5}
//       className={`${iconBase} ${filled ? 'text-white drop-shadow-sm scale-110 font-bold' : 'text-gray-400 hover:text-gray-200'} transition-all duration-200`}
//     >
//       <path
//         strokeLinecap="round"
//         strokeLinejoin="round"
//         d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.94 0-3.64 1.126-4.312 2.733-.672-1.607-2.372-2.733-4.313-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 8.063 11.25 9 11.25s9-4.03 9-11.25z"
//       />
//     </svg>
//   );
// }

function CommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={iconBase}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.5 8.25h9m-9 3h9m3 0a6.75 6.75 0 01-6.75 6.75H9l-3.75 3v-3A6.75 6.75 0 015.25 5.25h8.25A6.75 6.75 0 0120.25 12z"
      />
    </svg>
  );
}

function DotsIcon({ post }: any) {
  const router = useRouter();
  const [hasPop, setHasPop] = React.useState(false);
  const userid = useUserId();
  const own = userid === post?.user?._id;
  
  return (<>
    {hasPop ? <div className="d-flex fixed bg-[#0e0e0e80] top-0 h-[100dvh] bottom-0 left-0 right-0" onClick={(e) => { 
        setHasPop(false);
      }}>
      <div className="bg-gray-800 text-white p-4 rounded shadow-lg mt-[25vh] right-4 top-12 z-10 mx-auto my-auto min-w-[240px] max-w-[280px]" style={{
      
      }} >
        <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded" onClick={async() => {
          await navigator.share({
                    title: post?.user?.nickname+"'s post",
                    text: post?.content?.slice(0, 100) + (post?.content?.length > 100 ? '...' : ''),
                    url: window.location.origin + `/post/${post._id}`
                });
          setHasPop(false);
        }}>Share</div>
        <div className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded" onClick={() => {
          navigator.clipboard.writeText(window.location.origin + `/post/${post._id}`); setHasPop(false);toast.success("Link copied to clipboard");
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
    <svg 
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    // This is where the new size (h-10 w-10) and interactive styling are applied
    className={iconBase} 
    onClick={(e) => { 
        setHasPop(!hasPop);
    }}
>
    <path d="M6.75 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm7.5 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
</svg>
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
  onMore,
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
        <HeartIcon fill={liked ? "currentColor" : "none"}   />
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
        <MessageCircleIcon />
        <span className="text-sm tabular-nums">{commentCount}</span>
      </button>

      <button
        type="button"
        className="ml-auto px-3 py-2 rounded hover:bg-gray-700/50 transition-colors duration-200 text-gray-400 hover:text-gray-200"
        onClick={(e: any) => {
          const click=e?.target?.children[0]?.click
          click&&click()
        }}
        aria-label="More options"
      >
        <DotsIcon post={ post } />
      </button>
    </div>
  );
}