import React, { useState, useEffect, useRef } from "react";
import callIcon from "@public/icons/callIcon.svg";
import microphoneIcon from "@public/icons/microphoneIcon.svg";
import microphoneslashIcon from "@public/icons/microphoneslashIcon.svg";
import cameraIcon from "@public/icons/cameraIcon.svg";
import flipCameraIcon from "@public/icons/cameraflipIcon.svg";
import { useParams, useRouter } from "next/navigation";
// import { useSelector, useDispatch } from "react-redux";
// import { set_reject_answer } from "../../app/features/message/messageSlice";
// import { socket } from "../../../api/config";
// import { Info } from "../profileview/info";


let callMin = null;

let Localstream: MediaStream | null = null;
let Remotestream: MediaStream | null = null;

let send_offer1 = false;
let send_offer2 = false;

let answerid = "";
let callerid = "";
let callerName = "";
let data = {};
const Servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
};

export const VideoCallPage = () => {
  const pc = new RTCPeerConnection(Servers);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOff, setIsCameraOff] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(true);
  const mainVideoRef = useRef(null);
  const thumbnailVideoRef = useRef(null);
  // const video_call_message = useSelector(
  //   (state) => state.message.video_call_message
  // );
  // const video_call_data = useSelector((state) => state.message.video_call_data);
  // const spd_call = useSelector((state) => state.message.spd_call);
  // const login = useSelector((state) => state.register.logedin);
  // const rejectAnswer = useSelector((state) => state.message.rejectAnswer);
  // const offer = useSelector((state) => state.message.offer);
  // const userid = useSelector((state) => state.register.userID);
  // const navigate = useRouter();
  // const dispatch = useDispatch();
  // const { call } = useParams();
  // const [isFrontCamera, setIsFrontCamera] = useState<boolean>(true);
  // const [callTime, setcallTime] = useState<boolean>();
  // let Interval: string | null = null;
  // const startCall = useRef(null);
  // const [storemin, setstoremin] = useState(false);

  const [showButtons, setShowButtons] = useState(false);

  // const toggleButtonsVisibility = () => {
  //   setShowButtons(true);
  //   setTimeout(() => {
  //     setShowButtons(false);
  //   }, 3000);
  // };

  // useEffect(() => {
  //   toggleButtonsVisibility();
  // }, []);

  // const startVideoStream = async (useFrontCamera = true) => {
    // try {
      // const constraints = {
      //   video: { facingMode: useFrontCamera ? "user" : "environment" }, // Flip camera
      //   audio: true,
      // };

      // Localstream = await navigator.mediaDevices.getUserMedia(constraints);
      // Remotestream = new MediaStream();

      // console.log("localstream "+Localstream)

      // Push video stream to the peer connection
      //  Localstream.getTracks().forEach((track) => {
      //     console.log("stream working")
      //     pc.addTrack(track, Localstream);

      //   });

      //   // Get client stream track of peer connection
      //   pc.ontrack = (event) => {
      //     event.streams[0].getTracks().forEach((tracks) => {
      //       Remotestream.addTrack(tracks);
      //     });
      //   };

      // Attach the streams
      // mainVideoRef.current.srcObject = Remotestream;

      // thumbnailVideoRef.current.srcObject = Localstream;
      // //thumbnailVideoRef.current.play()

      // let statstus = call.split(",");
      // if (statstus[0] === "caller") {
      //   console.log("making call");
      //   await makeCall(Localstream, Remotestream);
      // }

  //     if (statstus[0] === "answer") {
  //       console.log("answer call");
  //       await answerCall(Localstream, Remotestream);
  //     }
  //   } catch (error) {
  //     console.error("Error accessing media devices:", error);
  //     //navigate("/")
  //   }
  // };

  // useEffect(() => {
  //   if (!login) {
  //     window.location.href = "/";
  //   }

  //   if (startCall.current === null) {
  //     startCall.current = true;
  //     startVideoStream(isFrontCamera);
  //   }

  //   return () => {
  //     const tracks = thumbnailVideoRef.current?.srcObject?.getTracks();
  //     tracks?.forEach((track) => track.stop());
  //   };
  // }, []);

  // useEffect(() => {
  //   if (video_call_data) {
  //      if(video_call_data.answer_message === "reject"){

  //       }
  //     let status = call.split(",");

  //   }
  // }, [video_call_data, video_call_message]);

  // useEffect(() => {
  //   if (rejectAnswer) {
  //     //getCall_min()
  //     window.location.href = "/";
  //     const tracks = Localstream?.getTracks();
  //     tracks?.forEach((track) => track.stop());
  //     if (Remotestream) {
  //       const tracks1 = Remotestream?.getTracks();
  //       tracks1?.forEach((track) => track.stop());
  //     }

  //     set_reject_answer(null);
  //   }
  // }, [rejectAnswer]);

  // const toggleCameraFlip = () => {
  //   setIsFrontCamera((prev) => !prev);
  //   startVideoStream(!isFrontCamera);
  // };

  // const calling_Miss_Min = () => {
  //   let callInfo = call.split(",");
  //   let fromid = callInfo[4];
  //   let toid = callInfo[5];
  //   let content = "call missed";
  //   let date = Date.now().toString();
  //   let notify = true;

  //   let myData = {
  //     fromid,
  //     toid,
  //     content,
  //     date,
  //     notify,
  //   };

  //   socket.emit("message", myData);

  //   data.answer_message = "reject";
  //   socket.emit("videocall", data);
  //   set_reject_answer(null);

  //   data.answer_message = "reject";
  //   socket.emit("videocall", data);
  //   set_reject_answer(null);
  //   clearInterval(Interval);

  //   navigate(-1);
  // };

  // const toggleMute = () => {
  //   setIsMuted(!isMuted);
  //   const tracks = Localstream?.getAudioTracks();
  //   tracks?.forEach((track) => (track.enabled = !isMuted));
  // };

  // const toggleCamera = () => {
  //   setIsCameraOff(!isCameraOff);
  //   const tracks = Localstream?.getVideoTracks();
  //   tracks?.forEach((track) => (track.enabled = !isCameraOff));
  // };

  // const endCall = () => {
  //   //alert("Call ended");
  //   pc.close();
  //   const tracks = Localstream?.getTracks();
  //   tracks?.forEach((track) => track.stop());
  //   if (Remotestream) {
  //     const tracks1 = Remotestream?.getTracks();
  //     tracks1?.forEach((track) => track.stop());
  //   }
  //   let stats = call.split(",");
  //   if (stats[0] === "caller") {
  //     getCall_min();
  //     if (callTime === null) {
  //       calling_Miss_Min();
  //     }
  //     data.answer_message = "reject";

  //     socket.emit("videocall", data);
  //     set_reject_answer(null);
  //     window.location.href = "/";
  //   }

  //   if (stats[0] === "answer") {
  //     // dispatch(set_calling(false))
  //     data.answer_message = "reject";
  //     socket.emit("videocall", data);
  //     set_reject_answer(null);
  //     window.location.href = "/";
  //   }
  // };

  // const getCall_min = () => {
  //   //console.log("call min "+callTime)
  //   if (callTime) {
  //     let timeNomw = new Date(Number(Date.now()));

  //     let totaltime = timeNomw.getTime() - callTime.getTime();
  //     let mytime = new Date(totaltime);
  //     let callInfo = call.split(",");
  //     let fromid = callInfo[4];
  //     let toid = callInfo[5];
  //     let min = mytime.getMinutes();
  //     let times = "";
  //     if (min <= 0) {
  //       times = `videocall ${mytime.getSeconds()} Sec`;
  //     } else {
  //       times = `videocall ${mytime.getSeconds()} Sec`;
  //     }
  //     let content = `${times}`;
  //     let date = `${Date.now()}`;
  //     let notify = false;

  //     let myData = {
  //       fromid,
  //       toid,
  //       content,
  //       date,
  //       notify,
  //     };

  //     socket.emit("message", myData);
  //   }
  // };

  // const makeCall = async (Localstream, Remotestream) => {
  //   let callData = call.split(",");
  //   answerid = callData[1];
  //   callerid = callData[2];
  //   callerName = callData[3];

  //   data.answer_id = answerid;
  //   data.caller_id = callerid;
  //   data.my_id = callerid;
  //   data.name = callerName;
  //   data.message = "";
  //   data.offer_can = "";
  //   data.answer_can = "";
  //   data.sdp_c_offer = "";
  //   data.sdp_a_offer = "";
  //   data.answer_message = "";
  //   data.fromid = callData[4];
  //   data.toid = callData[5];
  //   console.log("in making call");
  //   Interval = setInterval(calling_Miss_Min, 50000);

  //   Localstream.getTracks().forEach((track) => {
  //     //add localtracks so that they can be sent once the connection is established
  //     console.log("sending localstream track to peer connection");
  //     pc.addTrack(track, Localstream);
  //   });

  //   pc.addEventListener("signalingstatechange", (event) => {
  //     console.log(event);
  //     console.log(pc.signalingState);
  //   });

  //   pc.addEventListener("icecandidate", (e) => {
  //     console.log("........Ice candidate found!......");
  //     console.log(e);
  //     if (e.candidate) {
  //       if (e.candidate) {
  //         data.offer_can = e.candidate;
  //         console.log("sending call offer can ");
  //         socket.emit("videocall", data);
  //       }
  //     }
  //   });

  //   pc.addEventListener("track", (e) => {
  //     console.log("Got a track from the other peer!! How excting");
  //     console.log(e);
  //     e.streams[0].getTracks().forEach((track) => {
  //       Remotestream.addTrack(track, Remotestream);
  //       console.log("Here's an exciting moment... fingers cross");
  //       if (connecting === true) {
  //         setcallTime(new Date(Number(Date.now())));

  //         console.log("call min " + callMin);

  //         setConnecting(false);

  //         if (Interval !== null) {
  //           clearInterval(Interval);
  //           Interval = null;
  //         }
  //       }
  //     });
  //   });

  //   try {
  //     console.log("Creating offer...");
  //     const offer = await pc.createOffer();
  //     console.log(offer);
  //     await pc.setLocalDescription(offer);
  //     let callOffer = {
  //       sdp: offer.sdp,
  //       type: offer.type,
  //     };
  //     data.sdp_c_offer = offer;

  //     socket.emit("videocall", data); //send offer to signalingServer

  //     socket.on(`v_id_${userid}_answeroffer`, async (data) => {
  //       if (!pc.currentRemoteDescription && data.sdp) {
  //         console.log("answer sdpr " + data.sdp);
  //         const answer_despcription = new RTCSessionDescription(data.sdp);
  //         await pc.setRemoteDescription(answer_despcription);
  //       }

  //       if (data.offer) {
  //         console.log("answer offer ice");

  //         const candidate = new RTCIceCandidate(data.offer);
  //         await pc.addIceCandidate(candidate);
  //       }
  //     });

  //     // socket.on(`v_id_${userid}_answerice`, async (data)=>{

  //     //   if(data){

  //     //     console.log("answer ice "+data)
  //     //     const candidate = new RTCIceCandidate(data);
  //     //     await pc.addIceCandidate(candidate)

  //     //   }

  //     // })
  //   } catch (err) {
  //     console.log("offer not success");
  //     console.log(err);
  //   }

  //   //  const off_description = await pc.createOffer();
  //   //  await pc.setLocalDescription(off_description);
  //   // const offer = {
  //   //   sdp: off_description.sdp,
  //   //   tyoe: off_description.type,
  //   // };

  //   // data.sdp_c_offer = off_description;

  //   // socket.emit("videocall", data);

  //   //    pc.onicecandidate = (event) => {
  //   //    console.log("ice event running")
  //   //   if (event.candidate) {
  //   //     data.offer_can = event.candidate
  //   //     console.log("offr can "+data.offer_can)
  //   //     socket.emit("videocall", data);
  //   //   }
  //   // };
  // };

  // const answerCall = async (Localstream, Remotestream) => {
  //   data.answer_id = video_call_data.answer_id;
  //   data.caller_id = video_call_data.caller_id;
  //   data.my_id = video_call_data.answer_id;
  //   data.fromid = video_call_data.fromid;
  //   data.toid = video_call_data.toid;
  //   data.name = "";
  //   data.message = "";
  //   data.offer_can = "";
  //   data.answer_can = "";
  //   data.sdp_c_offer = "";
  //   data.sdp_a_offer = "";
  //   data.answer_message = "";

  //   Localstream.getTracks().forEach((track) => {
  //     //add localtracks so that they can be sent once the connection is established
  //     pc.addTrack(track, Localstream);
  //   });

  //   pc.addEventListener("signalingstatechange", (event) => {
  //     console.log(event);
  //     console.log(pc.signalingState);
  //   });

  //   pc.addEventListener("icecandidate", (e) => {
  //     console.log("........Ice candidate found!......");
  //     console.log(e);
  //     // sending answer iceCandidate to the offer
  //     if (e.candidate) {
  //       data.answer_can = e.candidate;
  //       console.log("sending answer offer can");
  //       socket.emit("videocall", data);
  //     }
  //   });

  //   pc.addEventListener("track", (e) => {
  //     console.log("Got a track from the other peer!! How excting");
  //     console.log(e);

  //     if (connecting === true) {
  //       setConnecting(false);
  //     }

  //     e.streams[0].getTracks().forEach((track) => {
  //       Remotestream.addTrack(track, Remotestream);
  //       console.log("Here's an exciting moment... fingers cross");
  //     });
  //   });

  //   //let callinfo = await socket.emitWithAck("videocall",data)

  //   if (spd_call) {
  //     console.log("call offer insde answer ");

  //     await pc.setRemoteDescription(new RTCSessionDescription(spd_call));
  //   }

  //   const answercan = await pc.createAnswer(); //just to make the docs happy
  //   await pc.setLocalDescription(answercan); //this is CLIENT2, and CLIENT2 uses the answer as the localDesc
  //   //console.log(offerObj)
  //   console.log(answercan);

  //   let offer_anwer = {
  //     sdp: answercan.sdp,
  //     type: answercan.type,
  //   };

  //   data.sdp_a_offer = answercan;
  //   socket.emit("videocall", data);

  //   //

  //   // const answer_description = await pc.createAnswer();
  //   // await pc.setLocalDescription(answer_description);
  //   // const answer = {
  //   //   sdp: answer_description.sdp,
  //   //   tyoe: answer_description.type,
  //   // };

  //   // data.sdp_a_offer = answer_description;
  //   // socket.emit("videocall", data);

  //   //  pc.onicecandidate = (event) => {
  //   //   if (event.candidate) {
  //   //     data.answer_can = event.candidate
  //   //     socket.emit("videocall", data);
  //   //   }
  //   // };

  //   // console.log("offcan "+video_call_data.sdp_c_offer)
  //   //  console.log("ice candidate "+video_call_data.offer_can)

  //   socket.on(`v_id_${userid}_calloffer`, async (data) => {
  //     if (data.offer) {
  //       console.log("call ice");

  //       await pc.addIceCandidate(new RTCIceCandidate(data.offer));
  //       setConnecting(false);
  //     }
  //   });
  // };

  return (

     <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 mx-auto bg-black"> {/*onClick={toggleButtonsVisibility}*/}

      <div className='w-full flex flex-col md:items-center md:justify-center'>
      {connecting && (
        <div className="absolute top-1/2 left-1/2 md:w-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-3xl">
          Connecting...
        </div>
      )}

      {/* Main Video */}
      <div className="absolute z-10 flex-1 min-h-screen">
        {!isCameraOff ? (
          <video
            ref={mainVideoRef}
            autoPlay
            muted={isMuted}
            // playsinline
            className="w-full h-screen object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white text-2xl">
            Camera is off
          </div>
        )}
      </div>

      {/* Thumbnail Video */}
      <div className="absolute top-7 right-5 lg:right-1/4 xl:right-1/4  mt-5  w-18 h-40 bg-gray-200 rounded-lg overflow-hidden shadow-md z-20">
        <video
          ref={thumbnailVideoRef}
          autoPlay
          // playsinline
          muted
          className="w-28 h-full object-cover"
        />
      </div>

      {/* Call Controls */}
      <div
        className={`absolute bottom-20 w-full flex justify-center space-x-6 z-50 ${
          showButtons ? "" : "hidden"
        }`}
      >
        <button className="control-button"> {/*onClick={toggleCamera}*/}
          <img src={cameraIcon} alt="Camera" className="w-14 h-10" />
        </button>
        <button className="control-button"> {/*onClick={toggleCamera}*/}
          <img src={flipCameraIcon} alt="Flip Camera" className="w-14 h-10" />
        </button>
        <button className="control-button red"> {/*onClick={toggleCamera}*/}
          <img src={callIcon} alt="End Call" className="w-14 h-10" />
        </button>
        <button className="control-button"> {/*onClick={toggleCamera}*/}
          <img
            src={isMuted ? microphoneslashIcon : microphoneIcon}
            alt="Microphone"
            className="w-14 h-10"
          />
        </button>
      </div>
      </div>
    
    </div>
  );
}
