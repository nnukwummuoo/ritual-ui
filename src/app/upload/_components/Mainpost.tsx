"use client"
import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
// import { useDispatch, useSelector } from "react-redux";
// import { createpost } from "../../app/features/post/post";
// import { PostImage } from "./postImage";
// import { Postvideo } from "./Postvideo";
// import person from "../../icons/icons8-profile_Icon.png";
// import "../../styles/Toastify__toast.css";

import { FaImage, FaVideo } from "react-icons/fa";

export const Mainpost = () => {
  // const dispatch = useDispatch();
  // const photo = useSelector((state) => state.comprofile.profilephoto);
  // const token = useSelector((state) => state.register.refreshtoken);
  // const poststatus = useSelector((state) => state.post.poststatus);
  // const userid = useSelector((state) => state.register.userID);
  // const [propics, setpropics] = useState(person);
  const [postcontent, setpostcontent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // useEffect(() => {
  //   if (photo) setpropics(photo);
  // }, [photo]);

  // const mypost = async () => {
  //   if (!postcontent.trim()) {
  //     toast.error("You have not said anything", { autoClose: 2000 });
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     // const response = await dispatch(
  //     //   createpost({
  //     //     userid,
  //     //     postlink: "",
  //     //     content: postcontent,
  //     //     token,
  //     //     posttype: "text",
  //     //   })
  //     // );
  //     console.log(response);
  //     if (response.payload.ok) {
  //       toast.success(response.payload.message, { autoClose: 1000 });

  //       setpostcontent("");
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="bg-gray-900 text-white p-4 rounded-md space-y-5 max-w-2xl mx-auto border border-gray-700 2xl:mr-[38rem] md:mr-[30rem]">
      <ToastContainer
        position="top-center"
        theme="dark"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          maxWidth: 500,
        }}
      />

      {/* Text Post Section */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <textarea
            className="w-full p-2 text-white bg-transparent border border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="What's hot?!"
            rows={3}
            value={postcontent}
            onChange={(e) => setpostcontent(e.target.value)}
          />
        </div>

        <div className="flex justify-end">
          <button
            // onClick={mypost}
            disabled={loading}
            className="w-full py-2 font-semibold text-white transition bg-orange-600 rounded-lg hover:bg-orange-500"
          >
            {loading ? "Posting" : "Post"}
          </button>
        </div>
      </div>

      {/* Image Upload Section */}
      <div
        className="flex items-center gap-3 p-4 transition border border-gray-500 border-dashed rounded-lg cursor-pointer hover:bg-gray-800"
        // onClick={() =>
        //   toast(<PostImage contents={postcontent} />, {
        //     autoClose: false,
        //   })
        // }
      >
        <FaImage className="text-xl text-green-400" />
        <span className="text-sm">Click to post image</span>
      </div>

      {/* Video Upload Section */}
      <div
        className="flex items-center gap-3 p-4 transition border border-gray-500 border-dashed rounded-lg cursor-pointer hover:bg-gray-800"
        // onClick={() =>
        //   toast(<Postvideo contents={postcontent} />, {
        //     autoClose: false,
        //   })
        // }
      >
        <FaVideo className="text-xl text-purple-400" />
        <span className="text-sm">Click to post video</span>
      </div>
    </div>
  );
};
