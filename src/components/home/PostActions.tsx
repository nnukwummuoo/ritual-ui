"use client";
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store/store";
import { useUserId } from "@/lib/hooks/useUserId";
import { toast } from "material-react-toastify";
import { useRouter } from "next/navigation";
import { deletesinglepost } from "@/store/post";

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
};

const iconBase = "size-6"; // Tailwind for width/height

function StarIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={iconBase}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.48 3.499a.562.562 0 011.04 0l1.462 3.726a.563.563 0 00.475.35l3.993.308c.499.039.701.663.322.988l-3.04 2.6a.563.563 0 00-.181.557l.93 3.86a.562.562 0 01-.848.61l-3.39-2.063a.563.563 0 00-.586 0L7.567 16.45a.562.562 0 01-.848-.61l.93-3.86a.563.563 0 00-.181-.557l-3.04-2.6a.563.563 0 01.322-.988l3.993-.308a.563.563 0 00.475-.35l1.462-3.726z"
      />
    </svg>
  );
}

function HeartIcon({ filled }: { filled?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.5}
      className={iconBase}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.94 0-3.64 1.126-4.312 2.733-.672-1.607-2.372-2.733-4.313-2.733C5.099 3.75 3 5.765 3 8.25c0 7.22 8.063 11.25 9 11.25s9-4.03 9-11.25z"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={iconBase}>
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

  return (
    <>
      {hasPop ? (
        <div
          className="d-flex fixed bg-[#0e0e0e80] top-0 h-[100dvh] bottom-0 left-0 right-0"
          onClick={(e) => {
            setHasPop(false);
          }}>
          <div
            className="bg-gray-800 text-white p-4 rounded shadow-lg mt-[25vh] right-4 top-12 z-10 mx-auto my-auto min-w-[240px] max-w-[280px]"
            style={{}}>
            <div
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
              onClick={async () => {
                await navigator.share({
                  title: post?.user?.nickname + "'s post",
                  text:
                    post?.content?.slice(0, 100) +
                    (post?.content?.length > 100 ? "..." : ""),
                  url: window.location.origin + `/post/${post._id}`,
                });
                setHasPop(false);
              }}>
              Share
            </div>
            <div
              className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
              onClick={() => {
                navigator.clipboard.writeText(
                  window.location.origin + `/post/${post._id}`
                );
                setHasPop(false);
                toast.success("Link copied to clipboard");
              }}>
              Copy Link
            </div>
            {own && (
              <>
                <div
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    /* Implement edit functionality here */ setHasPop(false);
                    router.push(`/post/${post?._id}/edit`);
                  }}>
                  Edit Post
                </div>

                <div
                  className="block w-full text-left px-4 py-2 hover:bg-gray-700 rounded text-red-600"
                  onClick={async () => {
                    /* Implement delete functionality here */
                    const tst = toast.loading("Deleting");
                    try {
                      setHasPop(false);
                      await deletesinglepost(post?._id);
                      router.push("/");
                    } catch (err) {
                      console.error(err);
                      toast.error("Error deleting post");
                    } finally {
                      toast.dismiss(tst);
                    }
                  }}>
                  Delete Post
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <></>
      )}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconBase}
        onClick={(e) => {
          setHasPop(!hasPop);
        }}>
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
}: PostActionsProps) {
  return (
    <div
      className={`flex items-center justify-between text-gray-200 ${className}`}>
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50 ${
          starred ? "text-white" : ""
        }`}
        onClick={onStar}
        aria-label="Star"
        aria-pressed={!!starred}>
        <StarIcon filled={starred} />
      </button>

      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50"
        onClick={onLike}
        aria-label="Like">
        <HeartIcon filled={liked} />
        <span className="text-sm tabular-nums">{likeCount}</span>
      </button>

      <button
        type="button"
        className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700/50"
        onClick={onComment}
        aria-label="Comment">
        <CommentIcon />
        <span className="text-sm tabular-nums">{commentCount}</span>
      </button>

      <button
        type="button"
        className="ml-auto px-3 py-2 rounded hover:bg-gray-700/50"
        onClick={(e: any) => {
          const click = e?.target?.children[0]?.click;
          click && click();
        }}
        aria-label="More options">
        <DotsIcon post={post} />
      </button>
    </div>
  );
}
