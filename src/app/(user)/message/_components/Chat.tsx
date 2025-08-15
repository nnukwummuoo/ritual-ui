import React, { useEffect, useRef, useState } from "react";
import videocamIcon from "@/public/videocamIcon.svg";
import emojsicon from "@/public/addemojis.js.svg";
import sendIcon from "@/public/sendIcon.svg";
// import "emoji-picker-element";
import { Chatreply } from "./Chatreply";
import { Coinsendview } from "../List/Coinsendview";
import { useDispatch, useSelector } from "react-redux";
import PacmanLoader from "react-spinners/DotLoader";
import dodoIcon from "@/public/icons8-profile_Icon.png";
import postimageIcon from "@/public/postimageicon.svg";
import backIcon from "@/public/backIcon.svg";
import "@/styles/Navs.css";
import "@/styles/Chat.css";
import { useParams, useRouter } from "next/navigation";
import DropdownMenu from "./DropdownMenu";
// import goldIcon from "@/public/icons8.png";
// import DropdownMenu from "./dropdown";
// import DummyPics from "@/public/icons8-profile_Icon.png";
// import { toast } from "react-toastify";
// import { downloadImage } from "../../api/sendImage";
// import { send_gift } from "../../app/features/message/messageSlice";
// import Options from "@/public/menu.svg";
// import { socket } from "../../../api/config";
// import { Model } from "../modelviews/Model";
// import onlineIcon from "@/public/onlineIcon.svg";
// import offlineIcon from "@/public/offlineIcon.svg";
// import starIcon from "@/public/star.png";
// import {
//   getchat,
//   changemessagestatus,
//   updatemessage,
//   send_gift,
// } from "../../app/features/message/messageSlice";


let mychat = "yes";
let messageType = "";
let ClientMess;
type messagestatus = "idle" | "loading" | "succeeded" | "failed";
const messagestatus: messagestatus = "idle";
export const Chat = () => {
  const msgListref = useRef(null);
  // const messagestatus = useSelector(
  //   (state) => state.message.currentmessagestatus
  // );
  // const giftstats = useSelector((state) => state.message.giftstats);
  // const giftmessage = useSelector((state) => state.message.giftmessage);
  // const oldMessage = useSelector((state) => state.message.listofcurrentmessage);
  // const chatinfo = useSelector((state) => state.message.chatinfo);
  // const modelID = useSelector((state) => state.profile.modelID);
  // const balance = useSelector((state) => state.profile.balance);
  // const modelname = useSelector((state) => state.profile.modelname);
  // const modelphotolink = useSelector((state) => state.profile.modelphotolink);
  // const profilephotolink = useSelector((state) => state.comprofile.photoLink);
  // const profilename = useSelector((state) => state.profile.firstname);
  const dispatch = useDispatch();
  const { modelid } = useParams<{ modelid: string }>();
  const userid = "94i42noip3jed3po3ed3j"
  // let userid = useSelector((state) => state.register.userID);

  // const login = useSelector((state) => state.register.logedin);
  // const token = useSelector((state) => state.register.refreshtoken);
  const router = useRouter();
  const ref = useRef(true);

  const [MYID, setMYID] = useState(userid);
  const [chatphotolink, setchatphotolink] = useState("");
  const [chatusername, setchatusername] = useState("");
  const [chatfirstname, setfirstname] = useState("");

  const [Chatname, set_Chatname] = useState("");
  const [Chatphoto, set_Chatphoto] = useState(dodoIcon);

  const [showemoji, setemoji] = useState(false);
  const [text, settext] = useState("");
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0f03fc");

  const [gift_click, setgift_click] = useState(false);
  const [gold_amount, setgold_amount] = useState("50");
  let [sendL, setsendL] = useState(false);
  let [sendcolor, setsend_color] = useState("#f7f5f5");

  const [message, setmessage] = useState([]);

  const messagelist = () => {
    if (loading === false) {
      let ids = modelid.split(",");
      if (message.length > 0) {
        return (
          <ul
            className="mb-2 bg-black md:w-[44rem] w-96 md:px-2"
            ref={msgListref}
          >
            {message.map((value: {id: string, coin: boolean, content: string, date: string, photolink: string, name: string}) => {
              if (value.id === userid) {
                if (value.coin) {
                  return (
                    <div className="flex justify-end mb-3">
                      <Coinsendview
                        name={"you"}
                        price={value.content}
                        date={value.date}
                      />
                    </div>
                  );
                } else if (!value.coin) {
                  return (
                    <div className="flex justify-end mb-3">
                      <Chatreply
                        img={value.photolink}
                        username={value.name}
                        content={value.content}
                        date={value.date}
                        id={value.id}
                        className="bg-orange-500 rounded-xl hover:bg-orange-300 active:bg-orange-200"
                      />
                    </div>
                  );
                }
              } else {
                if (value.coin) {
                  return (
                    <div className="flex justify-start mb-3">
                      <Coinsendview
                        name={value.name}
                        price={value.content}
                        date={value.date}
                      />
                    </div>
                  );
                } else if (!value.coin) {
                  return (
                    <div className="flex justify-start mb-3">
                      <Chatreply
                        img={value.photolink}
                        username={value.name}
                        content={value.content}
                        date={value.date}
                        id={value.id}
                        className="bg-slate-500 rounded-xl hover:bg-slate-300 active:bg-slate-200"
                      />
                    </div>
                  );
                }
              }
            })}
          </ul>
        );
      } else {
        return (
          <div>
            <p className="text-center text-slate-400">Start Conversation!</p>
          </div>
        );
      }
    }
  };

  // useEffect(() => {
  //   //am the client
  //   if (messagestatus !== "loading") {
  //     let ids = modelid.split(",");

  //     if (ids[0] === userid) {
  //       mychat = "yes";
  //     }
  //     dispatch(
  //       getchat({
  //         token,
  //         modelid: ids[0],
  //         clientid: ids[1],
  //         mychat,
  //       })
  //     );
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!login) {
  //     window.location.href = "/";
  //   }
  //   if (message.length > 0) {
  //     const last = msgListref.current.lastElementChild;
  //     if (last) {
  //       last.scrollIntoView();
  //     }
  //   }

  //   if (messagestatus === "failed") {
  //     console.log("failed");
  //     setLoading(false);
  //   }

  //   if (messagestatus === "succeeded") {
  //     dispatch(changemessagestatus("idle"));
  //     updateChat();
  //     setmessage(oldMessage);
  //     setLoading(false);

  //     socket.on("LiveChat", (data) => {
  //       let ids = modelid.split(",");
  //       if (ids[0] === data.data.fromid && MYID === data.data.toid) {
  //         // console.log(data)
  //         dispatch(updatemessage({ date: data.data.date, token }));
  //         let info = {
  //           name: data.name,
  //           photolink: data.photolink,
  //           content: data.data.content,
  //           date: data.data.date,
  //           id: data.data.fromid,
  //           coin: data.data.coin,
  //         };

  //         setmessage((value) => [...value, info]);
  //       }
  //     });
  //   }

  //   if (giftstats === "succeeded") {
  //     // let sent_text = ` ${gold_amount} Gold success`;
  //     // send_chat(sent_text);
  //     setgold_amount("50");
  //     setgift_click(false);
  //     setsendL(false);
  //     dispatch(changemessagestatus("idle"));
  //   }

  //   if (giftstats === "failed") {
  //     toast.error(`${giftmessage}`, { autoClose: 2000 });
  //     setgift_click(false);
  //     setsendL(false);
  //     dispatch(changemessagestatus("idle"));
  //   }
  // }, [message, messagestatus, giftstats]);

  // const check_balance = () => {
  //   let my_balance = parseFloat(balance);
  //   let send_amount = parseFloat(gold_amount);

  //   if (my_balance >= send_amount) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  // };

  // const send_coin = () => {
  //   if (check_balance()) {
  //     let ids = modelid.split(",");

  //     if (giftstats !== "loading") {
  //       let content = {
  //         fromid: userid,
  //         content: `${gold_amount}`,
  //         toid: ids[0],
  //         date: Date.now().toString(),
  //         favourite: false,
  //         notify: true,
  //         coin: true,
  //       };

  //       //let ids = modelid.split(",");

  //       socket.emit("message", content);
  //       setsendL(true);
  //       dispatch(
  //         send_gift({
  //           token,
  //           modelid: ids[0],
  //           userid: userid,
  //           amount: `${gold_amount}`,
  //         })
  //       );

  //       setgift_click(false);

  //       let chats = {
  //         name: chatusername,
  //         content: content.content,
  //         date: content.date,
  //         photolink: chatphotolink,
  //         id: content.fromid,
  //         coin: true,
  //       };

  //       setmessage((value) => [...value, chats]);
  //     }
  //   } else {
  //     //route to topup page
  //     router.push("/topup");
  //   }
  // };

  // const send_chat = (text) => {
  //   if (text) {
  //     let reciver = modelid.split(",");

  //     if (userid) {
  //       setchatphotolink(profilephotolink);
  //       setchatusername(profilename);
  //     }

  //     let content = {
  //       fromid: userid,
  //       content: `${text}`,
  //       toid: reciver[0],
  //       date: Date.now().toString(),
  //       favourite: false,
  //       notify: true,
  //       coin: false,
  //     };

  //     //let ids = modelid.split(",");

  //     socket.emit("message", content);
  //     let chats = {
  //       name: chatusername,
  //       content: content.content,
  //       date: content.date,
  //       photolink: chatphotolink,
  //       id: content.fromid,
  //     };

  //     setmessage((value) => [...value, chats]);
  //     settext("");
  //   }
  // };

  // const updateChat = () => {
  //   if (chatinfo) {
  //     set_Chatname(chatinfo.name);
  //     setfirstname(chatinfo.firstname);
  //     if (chatinfo.photolink) {
  //       // let photo7 = downloadImage(chatinfo.photolink, "profile");
  //       let photo7 = chatinfo.photolink;
  //       set_Chatphoto(photo7);
  //     }
  //   }
  // };

  const [showEmoji, setShowEmoji] = useState(false);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);

  // Toggle emoji picker on button click
  // const toggleEmojiPicker = () => {
  //   setShowEmoji((prev) => !prev);
  // };

  // // Close emoji picker if clicked outside
  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     const target = event.target;
  //     if (
  //       emojiPickerRef.current &&
  //       !emojiPickerRef.current.contains(target) &&
  //       emojiButtonRef.current &&
  //       !emojiButtonRef.current.contains(target)
  //     ) {
  //       setShowEmoji(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  // // for clicked emoji to show on the input bar
  // useEffect(() => {
  //   const picker = emojiPickerRef.current;
  //   if (!picker) return;

  //   const handleEmojiClick = (e) => {
  //     const emoji = e.detail?.emoji?.unicode;
  //     if (emoji) {
  //       settext((prev) => prev + emoji);
  //     }
  //   };

  //   picker.addEventListener("emoji-click", handleEmojiClick);

  //   return () => {
  //     picker.removeEventListener("emoji-click", handleEmojiClick);
  //   };
  // }, [showEmoji]);

  return (
    <div className="">
      <div className="chat-container ">
        {/* Top bar */}
        <div className="bg-gray-800 chat-header ">
          <div className="flex items-center gap-2">
            <button className="text-black" onClick={() => router.push("-1")}>
              <img src={backIcon} alt="back" />
            </button>
            <div
              className="flex items-center gap-2 cursor-pointer"
              // onClick={() => router.push(`/profile/${chatinfo?.id}`)}
            >
              {/* <img
                src={Chatphoto}
                alt="profile"
                className="w-10 h-10 mb-1 rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DummyPics;
                }}
              /> */}
              <div className="flex flex-col">
                <p className="font-bold text-slate-300">{chatfirstname}</p>
                <p className="text-xs text-slate-300">{Chatname}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              // onClick={(e) => {
              //   let ids = modelid.split(",");
              //   if (Chatname) {
              //     let call = [
              //       "caller",
              //       `v_id_${ids[0]}`,
              //       `v_id_${userid}`,
              //       profilename,
              //       userid,
              //       ids[0],
              //     ];
              //     router(`/videocall/${call.toString()}`);
              //   }
              // }}
            >
              <img src={videocamIcon} alt="videocall" />
            </button>
            <div>
              <DropdownMenu />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="chat-content">
          {loading && (
            <div className="flex flex-col items-center ">
              <PacmanLoader
                color={color}
                loading={loading}
                size={35}
                aria-label="Loading Spinner"
              />
              <p className="text-sm text-center text-gray-600">
                Please wait...
              </p>
            </div>
          )}

          {gift_click && (
            <div className="absolute z-10 flex flex-col h-40 bg-blue-500 rounded-lg shadow w-80 top-1/2 md:left-16 left-8 shadow-black">
              <div className="flex w-full bg-black rounded-tl-lg rounded-tr-lg">
                <button
                  className="text-white"
                  // onClick={() => setgift_click(false)}
                >
                  <img alt="backIcon" src={backIcon}></img>
                </button>

                <p className="mx-auto text-xs font-bold text-center text-slate-300">
                  Gift Gold
                </p>
              </div>

              {sendL && (
                <div className="flex flex-col items-center mt-5">
                  <PacmanLoader
                    color={sendcolor}
                    loading={sendL}
                    size={15}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                  <p className="text-xs text-center text-slate-50">
                    Giftting... {gold_amount} Gold
                  </p>
                </div>
              )}

              <div className="flex items-center w-full h-full pl-2 pr-2">
                <div className="flex flex-col w-full bg-orange-500 rounded-lg">
                  <input
                    type="range"
                    min={50}
                    max={1000}
                    step={50}
                    onChange={(e) => setgold_amount(e.target.value)}
                  ></input>

                  <div className="flex flex-col items-center w-full">
                    <div className="flex pl-1 pr-1 mt-1 mb-1 bg-blue-500 rounded-lg">
                      <p className="font-bold text-white">{gold_amount}</p>

                      <img
                        alt="goldIcon"
                        src={require("@/public/icons8.png")}
                        className="object-cover w-5 h-5 mt-1 ml-1"
                      ></img>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center w-full pb-1 pl-2 pr-2">
                <button
                  className="w-full p-1 bg-green-500 rounded-2xl hover:bg-green-400 active:bg-green-300"
                  // onClick={(e) => send_coin()}
                >
                  <p className="text-xs font-bold text-white">Send</p>
                </button>
              </div>
            </div>
          )}

          <div className="">{messagelist()}</div>

          {showEmoji && (
            <div
              ref={emojiPickerRef}
              className="fixed z-50 transform -translate-x-1/2 bottom-20 left-1/2"
            >
              {/* <emoji-picker // eomoji-picker does not exist in jsx components type
                onClick={(e) => {
                  const emoji = e.detail?.emoji?.unicode;
                  if (emoji) {
                    settext(`${text}${emoji}`);
                    setemoji(false);
                  }
                }}
              /> */}
            </div>
          )}
        </div>

        {/* Gift button */}
        <button
          className="gold-button"
          onClick={() => {
            setgift_click(!gift_click);
            setgold_amount("50");
          }}
        >
          <img src={require("@/public/icons8.png")} alt="img" />
        </button>

        {/* Bottom Bar */}
        <div className="flex items-center gap-2 p-2 bg-gray-900 shadow-md chat-input-bar rounded-xl">
          <button className="flex-shrink-0">
            <img
              alt="postImageIcon"
              className="object-contain w-10 h-10"
              src={postimageIcon}
            />
          </button>

          <div className="flex items-center flex-1 px-3 py-1 bg-slate-500 rounded-2xl">
            <textarea
              className="flex-1 h-10 text-white placeholder-white bg-transparent outline-none resize-none"
              value={text}
              placeholder="Send message..."
              onChange={(e) => settext(e.target.value)}
            />
            <button
              ref={emojiButtonRef}
              // onClick={toggleEmojiPicker}
              className="ml-2"
            >
              <img alt="addemoji" src={emojsicon} className="w-6 h-6" />
            </button>
          </div>

          {/* <button onClick={() => send_chat(text)} className="flex-shrink-0"> replace onclick later */}
          <button className="flex-shrink-0">
            <img
              alt="sendicon"
              src={sendIcon}
              className="object-contain w-10 h-10"
            />
          </button>
        </div>
      </div>
     </div>
  );
};
