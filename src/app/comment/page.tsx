"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

import commentIcon from "../../icons/commentIcon.png";
import likeIcon from "../../icons/likeIcon.svg";
import shareIcon from "../../icons/shareIcon.svg";
import Options from "../../icons/menu.svg";
import SendIcon from "../../icons/send.png";

// import { Commentlist } from "./comment/Commentlist";
import {
  postcomment,
  resetcomment,
  editpostcomment,
  getpostcomment,
} from "@/store/comment";
import { getpostbyid, PostchangeStatus } from "@/store/post";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type CommentPageProps = {
  content: string;
  username: string;
  type: "text" | "image" | "video";
  file?: string;
  comments: number;
  likes: number;
  posttime: string;
  userphoto?: string;
  postid: string;
};

const CommentPage = ({
  content,
  username,
  type,
  file,
  comments,
  likes,
  posttime,
  userphoto,
  postid,
}: CommentPageProps) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const editcommentstatus = useSelector(
    (state: any) => state.comment.editcommentstatus
  );
  const getpostbyidstatus = useSelector(
    (state: any) => state.post.getpostbyidstatus
  );
  const commentstatus = useSelector((state: any) => state.comment.commentstatus);
  const allcomment = useSelector((state: any) => state.comment.allcomment);
  const userid = useSelector((state: any) => state.register.userID);
  const token = useSelector((state: any) => state.register.refreshtoken);
  const error = useSelector((state: any) => state.comment.error);

  const [liking, setLiking] = useState<string>("");
  const [commenting, setCommenting] = useState<string>("");
  const [commentcontent, setCommentcontent] = useState<string>("");
  const [buttontext, setButtontext] = useState("comment");
  const [btttonpress, setButtonpress] = useState(false);
  const [commentsid, setCommentsids] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    setLiking(`${likes}`);
    setCommenting(`${comments}`);
  }, [likes, comments]);

  useEffect(() => {
    if (commentstatus === "succeeded") {
      dispatch(getpostbyid({ postid, token }) as any);
      dispatch(getpostcomment({ token, postid: postid }) as any);
      toast.success("comment on post success", { autoClose: 2000 });
      dispatch(resetcomment("idle") as any);
      setCommentcontent("");
    }
    if (commentstatus === "failed") {
      toast.error(`${error}`, { autoClose: 2000 });
      dispatch(resetcomment("idle") as any);
    }

    if (editcommentstatus === "succeeded") {
      dispatch(getpostbyid({ postid, token }) as any);
      toast.success("edit comment success", { autoClose: 2000 });
      dispatch(resetcomment("idle") as any);
    }
    if (editcommentstatus === "failed") {
      toast.error(`${error}`, { autoClose: 2000 });
      dispatch(resetcomment("idle") as any);
    }

    if (getpostbyidstatus === "succeeded") {
      dispatch(PostchangeStatus("idle") as any);
    }

    if (getpostbyidstatus === "failed") {
      dispatch(PostchangeStatus("idle") as any);
    }
  }, [commentstatus, editcommentstatus, getpostbyidstatus, dispatch, postid, token, error]);

  const isFileImage = () => {
    if (type === "text") {
      return null;
    } else if (type === "image" && file) {
      return (
        <Image
          className="object-cover w-full mx-auto rounded-xl mt-1"
          alt="post image"
          src={file}
          width={600}
          height={400}
        />
      );
    } else if (type === "video" && file) {
      return (
        <video
          className="object-cover w-full mx-auto rounded-xl mt-1"
          src={file}
          controls
          controlsList="nodownload"
        />
      );
    }
  };

  const checkuser = () => {
    if (!userid) {
      toast.error("please login to comment on this post", { autoClose: 2000 });
      return;
    }

    if (!commentcontent) {
      toast.error("say something", { autoClose: 2000 });
      return;
    }

    if (btttonpress === true) {
      if (editcommentstatus === "idle") {
        toast.info("posting edited comment...", { autoClose: false });
        dispatch(
          editpostcomment({
            commentid: commentsid,
            token,
            content: commentcontent,
          }) as any
        );
      }
      router.push("/");
      return;
    }

    if (commentstatus !== "loading") {
      toast.info("please wait posting comment...", { autoClose: 2000 });
      dispatch(
        postcomment({ content: commentcontent, postid, userid, token }) as any
      );
    }
  };

  return (
    <div className="showcomment max-w-md p-4 mx-auto mt-10 text-white bg-gray-900 shadow-lg rounded-2xl">
        <div className="h-100 overflow-y-scroll pb-24" id="fullpage">
            <div className="flex flex-col p-5">
            <p className="text-slate-200">All Comments</p>

            <div className="flex mt-2 flex-col">
                <ul>
                {allcomment.length === 0 ? (
                    <p className="text-slate-400 text-center mt-4">
                    No comments yet
                    </p>
                ) : (
                    allcomment.map((value: any) => {
                    return (
                        // <Commentlist
                        //   key={value.commentid}
                        //   commentuserphoto={value.commentuserphoto}
                        //   commentusername={value.commentusername}
                        //   content={value.content}
                        //   commenttime={value.commenttime}
                        //   commentid={value.commentid}
                        //   commentuserid={value.commentuserid}
                        //   setcommentcontent={setCommentcontent}
                        //   postid={postid}
                        //   setbuttontext={setButtontext}
                        //   setbuttonpress={setButtonpress}
                        //   setcommentsids={setCommentsids}
                        //   nickname={value.commentnickname}
                        // />
                        <div></div>
                    );
                    })
                )}
                </ul>
            </div>
            </div>

            {/* Dropdown */}
            <div className="relative inline-block text-left">
            {isOpen && (
                <div
                className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                >
                <div className="py-1" role="none">
                    <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem"
                    >
                    Report
                    </a>
                    <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem"
                    >
                    Share
                    </a>
                    <a
                    href="#"
                    className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                    role="menuitem"
                    >
                    Block User
                    </a>
                </div>
                </div>
            )}
            </div>
        </div>

      {/* Input */}
        <div className="fixed bottom-16 left-36 px-4 pb-2 bg-gray-900 z-10 flex items-center gap-2 max-w-md ">
            <textarea
            className="textinpt placeholder:pt-1 w-full rounded-lg bg-gray-800 text-white border border-gray-600 py-2 px-3"
            value={commentcontent}
            placeholder="What is on your mind?"
            onInput={(e) => setCommentcontent(e.currentTarget.value)}
            rows={1}
            style={{ resize: "none" }}
            />
            <button
            className="rounded-lg bg-orange-500 p-2 flex items-center justify-center"
            onClick={checkuser}
            >
            <Image src={SendIcon} alt="send" width={24} height={24} />
            </button>
        </div>
    </div>
  );
};

export default CommentPage