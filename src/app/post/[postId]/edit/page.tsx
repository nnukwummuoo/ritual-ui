'use client';

import React from "react"
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { useParams } from "next/navigation";
import { URL as API_BASE } from "@/api/config";
import { useUserId } from "@/lib/hooks/useUserId";
import { fetchsinglepost, getallpost, hydrateFromCache, updatepost } from "@/store/post";
import { getprofile, follow as followThunk, unfollow as unfollowThunk } from "@/store/profile";
const PROD_BASE = "https://mmekoapi.onrender.com"; // fallback when local proxy is down
import { toast } from "material-react-toastify";
import {useRouter} from "next/navigation"
import { getImageSource } from "@/lib/imageUtils";

function PostSingle() {
        const router = useRouter()
        const loggedInUserId = useSelector((s: RootState) => s.register.userID);
        const authToken = useSelector((s: RootState) => s.register.refreshtoken || s.register.accesstoken);
        const {  nickname } = useSelector((s: RootState) => s.profile);
        const [thePost, setThePost] = React.useState<any>({});
        const p=thePost;
        const userid = useUserId();
        const own = userid === thePost?.user?._id;
    const { postId } = useParams();
    React.useLayoutEffect(()=>{
        (async () => {
            const tst = toast("Loading", { autoClose: false });
            try {
                const res=await fetchsinglepost(String(postId));
                setThePost(res);
            } catch (err) {
                console.error(err);
            }finally{
                toast.dismiss(tst)
            }
        })()
    }, [])
    const mediaRef =
        p?.postphoto ||
        p?.postvideo ||
        p?.postlink ||
        p?.postFile ||
        p?.file ||
        p?.proxy_view ||
        p?.file_link ||
        p?.media ||
        p?.image ||
        p?.video ||
        p?.thumblink ||
        // support top-level identifiers
        p?.publicId ||
        p?.public_id ||
        p?.imageId ||
        p?.postfilepublicid ||
        p?.postfilelink||
        "";
    const asString = typeof mediaRef === "string" ? mediaRef : (mediaRef?.publicId || mediaRef?.public_id || mediaRef?.url || "");
    const isHttpUrl = typeof asString === "string" && /^https?:\/\//i.test(asString);
    const isBlobUrl = typeof asString === "string" && /^blob:/i.test(asString);
    const isDataUrl = typeof asString === "string" && /^data:/i.test(asString);
    const isUrl = isHttpUrl || isBlobUrl || isDataUrl;
    
    // Use bucket detection for Storj URLs
    const imageSource = getImageSource(asString, 'post');
    const src = imageSource.src;
    return <>
        <div className="container mx-auto p-4">
            <div className="bg-[#efefef20] p-6 rounded-lg shadow-md">
                <div className="d-flex"> 
                    <h1 className="text-lg font-bold">Edit Post</h1>
                    {thePost?.createdAt?<div>{(new Date(thePost?.createdAt)).toString().split("(")[0]}</div>:""}
                </div>  
                <div className="mt-3 d-flex mb-3">
                    <textarea value={thePost.content} onChange={({target})=>{
                            setThePost((prev:any)=>({ ...prev, content: target.value }))
                    }} className="bg-[#efefef10] w-[100%] p-2 min-h-[25vh]"/>
                </div>
                {thePost?.posttype == "image"&& (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={src}
                    alt={p?.content || "post image"}
                    className="w-full max-h-[480px] object-contain rounded"
                />
                    )}
                {thePost?.posttype == "video"&&(
                    <video
                        src={src}
                        controls
                        className="w-full max-h-[480px] rounded"
                    />
                )}
                <div className="ms-auto mt-3"> 
                    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600" onClick={async () => {
                        if (p?.user?._id!==userid) {
                            toast.error("You Cannot edit this post");
                            return;
                        }
                        const tst= toast("Updating", { autoClose: false });
                        try{
                            const res = await updatepost(thePost._id, thePost);
                            setThePost(res);
                            toast.success("Post updated");
                            router.push(`/post/${thePost?._id}`)
                        } catch (err) {
                            toast.error("Error updating post");
                            console.error(err)
                        } finally {
                            toast.dismiss(tst)
                        }
                    } }>Save</button>
            </div>
            </div>

            
        </div>
    </>
}

export default PostSingle