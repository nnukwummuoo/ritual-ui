import React, { useEffect, useState } from "react";
// import comment from "../../icons/commentIcon.png";
// import like from "../../icons/likeIcon.svg";
// import shareIcon from "../../icons/shareIcon.svg";
// import { Commentlist } from "./comment/Commentlist";
// import {
//   postcomment,
//   resetcomment,
//   editpostcomment,
// } from "../../app/features/comment/comment";
// import { useDispatch, useSelector } from "react-redux";
// import { toast } from "material-react-toastify";
// import { useNavigate } from "react-router-dom";
// import { getpostbyid, PostchangeStatus } from "../../app/features/post/post";
// import Options from "../../icons/menu.svg";
// import { getpostcomment } from "../../app/features/comment/comment";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

type commentProps = {
  content: string,
  username: string,
  type: string,
  file: string | undefined,
  comments: number,
  likes: number,
  posttime: string,
  userphoto: string,
  postid: string,
}
export const Commmentpage = ({
  content,
  username,
  type,
  file,
  comments,
  likes,
  posttime,
  userphoto,
  postid,
}: commentProps) => {
  // const editcommentstatus = useSelector(
  //   (state) => state.comment.editcommentstatus
  // );
  // const getpostbyidstatus = useSelector(
  //   (state) => state.post.getpostbyidstatus
  // );
  // const commentstatus = useSelector((state) => state.comment.commentstatus);
  // const allcomment = useSelector((state) => state.comment.allcomment);
  // const userid = useSelector((state) => state.register.userID);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const error = useSelector((state) => state.comment.error);
  // const dispatch = useDispatch();
  // const navigate = useNavigate();

  const [liking, setliking] = useState("");
  const [commenting, setcommenting] = useState("");
  const [commentcontent, setcommentcontent] = useState("");
  const [buttontext, setbuttontext] = useState("comment");
  const [btttonpress, setbuttonpress] = useState(false);
  const [commentsid, setcommentsids] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  // const toggleDropdown = () => {
  //   setIsOpen((prev) => !prev);
  // };

  // useEffect(() => {
  //   setliking(`${likes}`);
  //   setcommenting(`${comments}`);
  // }, [likes, comments]);

  // useEffect(() => {
  //   if (commentstatus === "succeeded") {
  //     dispatch(getpostbyid({ postid, token }));
  //     dispatch(getpostcomment({ token, postid: postid }));
  //     toast.success("comment on post success", { autoClose: 2000 });
  //     dispatch(resetcomment("idle"));
  //     setcommentcontent('');
  //   }
  //   if (commentstatus === "failed") {
  //     toast.error(`${error}`, { autoClose: 2000 });
  //     dispatch(resetcomment("idle"));
  //   }

  //   if (editcommentstatus === "succeeded") {
  //     dispatch(getpostbyid({ postid, token }));
  //     toast.success("edit comment on success", { autoClose: 2000 });
  //     dispatch(resetcomment("idle"));
  //   }
  //   if (editcommentstatus === "failed") {
  //     toast.error(`${error}`, { autoClose: 2000 });
  //     dispatch(resetcomment("idle"));
  //   }

  //   if (getpostbyidstatus === "succeeded") {
  //     dispatch(PostchangeStatus("idle"));
  //   }

  //   if (getpostbyidstatus === "failed") {
  //     dispatch(PostchangeStatus("idle"));
  //   }
  // }, [commentstatus, editcommentstatus, getpostbyidstatus, dispatch, postid, token, error]);

  // const isFileImage = () => {
  //   if (type === "text") {
  //     return <></>;
  //   } else if (type === "image") {
  //     return (
  //       <img
  //         className="object-cover w-full mx-auto rounded-xl mt-1"
  //         alt="post image"
  //         src={file}
  //       ></img>
  //     );
  //   } else if (type === "video") {
  //     console.log("video format" + file);
  //     return (
  //       <video
  //         className="object-cover w-full mx-auto rounded-xl mt-1"
  //         alt="post image"
  //         src={file}
  //         controls
  //         controlsList="nodownload"
  //       ></video>
  //     );
  //   }
  // };

  // const checkuser = () => {
  //   if (!userid) {
  //     toast.error("please login to comment on this post", { autoClose: 2000 });
  //     return;
  //   }

  //   if (!commentcontent) {
  //     toast.error("say something", { autoClose: 2000 });
  //     return;
  //   }

  //   if (btttonpress === true) {
  //     if (editcommentstatus === "idle") {
  //       toast.info("posting edited comment...", { autoClose: false });
  //       dispatch(
  //         editpostcomment({
  //           commentid: commentsid,
  //           token,
  //           content: commentcontent,
  //         })
  //       );
  //     }
  //     navigate("/");
  //     return;
  //   }

  //   if (commentstatus !== "loading") {
  //     toast.info("please wait posting comment...", { autoClose: 2000 });
  //     dispatch(postcomment({ content: commentcontent, postid, userid, token }));
  //   }
  // };

  return (
    <div className="bg-gray-900 showcomment">
      <div className="h-100 overflow-y-scroll pb-24" id="fullpage">
        <div className="flex flex-col p-5">
          <p className="text-slate-200">All Comments</p>
          {/* {isFileImage()} */}
          <div className="flex mt-2 flex-col">
            <ul>
              {[].length === 0 ? (
                <p className="text-slate-400 text-center mt-4">No comments yet</p>
              ) : (
                // allcomment.map((value) => {
                //   return (
                //     <Commentlist
                //       commentuserphoto={value.commentuserphoto}
                //       commentusername={value.commentusername}
                //       content={value.content}
                //       commenttime={value.commenttime}
                //       key={value.commentid}
                //       commentid={value.commentid}
                //       commentuserid={value.commentuserid}
                //       setcommentcontent={setcommentcontent}
                //       postid={postid}
                //       setbuttontext={setbuttontext}
                //       setbuttonpress={setbuttonpress}
                //       setcommentsids={setcommentsids}
                //       nickname={value.commentnickname}
                //     />
                //   );
                // })
                "all comments:"
              )}
            </ul>
          </div>
        </div>

        <div>
          <div className="relative inline-block text-left">
            {isOpen && (
              <div
                className="absolute right-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
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
      </div>

      <div className="fixed bottom-16 left-0 right-0 px-4 pb-2 bg-gray-900 z-10 flex items-center gap-2">
        <textarea
          className="textinpt placeholder:pt-1 w-full rounded-lg bg-gray-800 text-white border border-gray-600 py-2 px-3"
          value={commentcontent}
          placeholder="What is on your mind?"
          onInput={(e) => {
            setcommentcontent(e.currentTarget.value);
          }}
          // rows="1"
          style={{ resize: "none" }}
        ></textarea>
        <button
          className="rounded-lg bg-orange-500 p-2 flex items-center justify-center"
          // onClick={checkuser}
        >
          <img src={"/icons/send.png"} alt="send" width={24} height={24} />
        </button>
      </div>
    </div>
  );
};