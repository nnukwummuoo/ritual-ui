// "use client";

// import { useEffect, useState, useRef } from "react";
// import Image from "next/image";
// import { format } from "date-fns";
// import { useDispatch, useSelector } from "react-redux";
// import { toast, Id } from "react-toastify";
// import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

// import person from "../../../icons/icons8-profile_Icon.png";
// import editcommenticon from "../../../icons/editcommenticon.svg";
// import deleteicon from "../../../icons/deleteicon.svg";
// import editicon from "../../../icons/edit.svg";

// import {
//   deletecomment,
//   resetcomment,
//   getpostcomment,
// } from "@/store/comment";
// import {
//   getpostbyid,
//   PostchangeStatus,
// } from "@/store/post";

// // ✅ Types for props
// interface CommentListProps {
//   commentuserphoto?: string;
//   commentusername: string;
//   content: string;
//   commenttime: string | number;
//   commentid: string;
//   commentuserid: string;
//   setcommentcontent: (val: string) => void;
//   setbuttontext: (val: string) => void;
//   setbuttonpress: (val: boolean) => void;
//   setcommentsids: (val: string) => void;
//   postid: string;
//   nickname?: string;
// }

// export const Commentlist: React.FC<CommentListProps> = ({
//   commentuserphoto,
//   commentusername,
//   content,
//   commenttime,
//   commentid,
//   commentuserid,
//   setcommentcontent,
//   setbuttontext,
//   setbuttonpress,
//   setcommentsids,
//   postid,
//   nickname,
// }) => {
//   const toastId = useRef<Id | null>(null);
//   const dispatch = useDispatch();

//   // ✅ Redux states (type `any` → strongly type if you have RootState)
//   const getpostbyidstatus = useSelector((state: any) => state.post.getpostbyidstatus);
//   const userid = useSelector((state: any) => state.register.userID);
//   const token = useSelector((state: any) => state.register.refreshtoken);
//   const deletecommentstatus = useSelector((state: any) => state.comment.deletecommentstatus);

//   const [options, setoption] = useState(false);
//   const [userphoto, setuserphoto] = useState<string>(person.src);

//   const alert = (message: string, type: "loading" | "success" | "error", close?: number | false) => {
//     toastId.current = toast(message, { type, autoClose: close });
//   };

//   const dismissalert = () => {
//     if (toastId.current) {
//       toast.dismiss(toastId.current);
//     }
//   };

//   // ✅ Handle delete + refetch
//   useEffect(() => {
//     if (deletecommentstatus === "succeeded") {
//       dispatch(getpostbyid({ postid, token }) as any);
//       dispatch(getpostcomment({ postid, token }) as any);
//       dismissalert();
//       dispatch(resetcomment("idle") as any);
//     }

//     if (deletecommentstatus === "failed") {
//       dispatch(getpostbyid({ postid, token }) as any);
//       dismissalert();
//       dispatch(resetcomment("idle") as any);
//     }

//     if (getpostbyidstatus === "succeeded" || getpostbyidstatus === "failed") {
//       dispatch(PostchangeStatus("idle") as any);
//     }
//   }, [deletecommentstatus, getpostbyidstatus, dispatch, postid, token]);

//   const showedit = () => userid === commentuserid;

//   const editcomment = () => {
//     setcommentcontent(content);
//     setbuttontext("replace comment");
//     setbuttonpress(true);
//     setcommentsids(commentid);
//   };

//   const deletemycomment = () => {
//     if (deletecommentstatus === "idle") {
//       alert("deleting comment please wait...", "loading", false);
//       dispatch(deletecomment({ token, commentid }) as any);
//     }
//   };

//   // ✅ Format timestamp
//   const date = format(new Date(Number(commenttime)), "MM/dd/yyyy 'at' h:mm a");

//   useEffect(() => {
//     if (commentuserphoto) {
//       setuserphoto(commentuserphoto);
//     }
//   }, [commentuserphoto]);

//   return (
//     <li>
//       <SkeletonTheme>
//         {getpostbyidstatus === "loading" ? (
//           <div className="space-y-4">
//             {[...Array(5)].map((_, index) => (
//               <div key={index} className="flex space-x-3 p-3 bg-gray-800 rounded-lg">
//                 <Skeleton circle height={40} width={40} />
//                 <div className="flex flex-col space-y-2 w-full">
//                   <Skeleton width={120} height={15} className="rounded-md" />
//                   <Skeleton width="90%" height={12} className="rounded-md" />
//                   <Skeleton width="70%" height={12} className="rounded-md" />
//                   <div className="flex space-x-4 mt-1">
//                     <Skeleton width={50} height={12} />
//                     <Skeleton width={50} height={12} />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <div className="flex-col mb-3 border pl-1 pr-1 rounded-2xl mt-2">
//             <div className="flex justify-between pl-1 pt-1 mb-1">
//               <div className="flex flex-row">
//                 <div className="w-fit h-fit bg-slate-500 rounded-full">
//                   <Image
//                     alt="user avatar"
//                     src={userphoto}
//                     width={40}
//                     height={40}
//                     className="w-10 h-10 object-cover rounded-full"
//                   />
//                 </div>
//                 <div className="flex flex-col">
//                   <p className="ml-2 font-semibold text-slate-200 text-sm">
//                     {commentusername}
//                   </p>
//                   <p className="ml-2 text-slate-400 text-sm">{nickname}</p>
//                 </div>
//               </div>

//               {showedit() && (
//                 <div>
//                   <button onClick={() => setoption(true)}>
//                     <Image src={editcommenticon} alt="edit" width={20} height={20} />
//                   </button>

//                   {options && (
//                     <div className="flex flex-col w-fit h-fit z-10 rounded-md">
//                       <button
//                         className="rounded-2xl"
//                         onClick={() => {
//                           setoption(false);
//                           deletemycomment();
//                         }}
//                       >
//                         <Image src={deleteicon} alt="delete" width={20} height={20} />
//                       </button>

//                       <button
//                         className="rounded-2xl"
//                         onClick={() => {
//                           setoption(false);
//                           editcomment();
//                         }}
//                       >
//                         <Image src={editicon} alt="edit" width={20} height={20} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <p className="text-slate-400 text-xs p-2 break-words">{content}</p>
//             <p className="text-green-300 font-bold text-xs pl-1 pb-1">
//               posted: {date}
//             </p>
//           </div>
//         )}
//       </SkeletonTheme>
//     </li>
//   );
// };
