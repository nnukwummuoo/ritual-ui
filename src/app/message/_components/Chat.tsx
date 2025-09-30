import React, { useEffect, useRef, useState } from "react";
// import "emoji-picker-element";
import { Chatreply } from "./Chatreply";
import { Coinsendview } from "../List/Coinsendview";
import { useDispatch, useSelector } from "react-redux";
import PacmanLoader from "react-spinners/DotLoader";
// image assets are served from /public; use URL paths instead of importing modules
import "@/styles/Navs.css";
import "@/styles/Chat.css";
import { useParams, useRouter } from "next/navigation";
import DropdownMenu from "./DropdownMenu";
// import goldIcon from "@/public/icons8.png";
// import DropdownMenu from "./dropdown";
// import DummyPics from "@/public/icons8-profile_Icon.png";
// import { toast } from "material-react-toastify";
// import { downloadImage } from "../../api/sendImage";
// import { send_gift } from "../../app/features/message/messageSlice";
// import Options from "@/public/menu.svg";
// import { socket } from "../../../api/config";
// import { Creator } from "../creatorviews/Creator";
// import onlineIcon from "@/public/onlineIcon.svg";
// import offlineIcon from "@/public/offlineIcon.svg";
// import starIcon from "@/public/star.png";
import { getchat, send_gift } from "@/store/messageSlice";
import type { RootState } from "@/store/store";
import { getSocket } from "@/lib/socket";


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
  // const creatorID = useSelector((state) => state.profile.creatorID);
  // const balance = useSelector((state) => state.profile.balance);
  // const creatorname = useSelector((state) => state.profile.creatorname);
  // const creatorphotolink = useSelector((state) => state.profile.creatorphotolink);
  // const profilephotolink = useSelector((state) => state.comprofile.photoLink);
  // const profilename = useSelector((state) => state.profile.firstname);
  const dispatch = useDispatch();
  const { creatorid } = useParams<{ creatorid: string }>();
  const userid = useSelector((state: RootState) => state.register.userID);

  // const login = useSelector((state) => state.register.logedin);
  // const token = useSelector((state) => state.register.refreshtoken);
  const router = useRouter();
  const ref = useRef(true);

  const [MYID, setMYID] = useState(userid);
  const [chatphotolink, setchatphotolink] = useState("");
  const [chatusername, setchatusername] = useState("");
  const [chatfirstname, setfirstname] = useState("");

  const [Chatname, set_Chatname] = useState("");
  const [Chatphoto, set_Chatphoto] = useState("/icons/dodoIcon.jpg");

  const [showemoji, setemoji] = useState(false);
  const [text, settext] = useState("");
  let [loading, setLoading] = useState(true);
  let [color, setColor] = useState("#0f03fc");

  const [gift_click, setgift_click] = useState(false);
  const [gold_amount, setgold_amount] = useState("50");
  let [sendL, setsendL] = useState(false);
  let [sendcolor, setsend_color] = useState("#f7f5f5");

  const [message, setmessage] = useState<any[]>([]);
  const currentmessagestatus = useSelector((state: RootState) => state.message.currentmessagestatus);
  const listofcurrentmessage = useSelector((state: RootState) => state.message.listofcurrentmessage);
  const chatinfo = useSelector((state: RootState) => state.message.chatinfo);

  useEffect(() => {
    if (currentmessagestatus === "succeeded") {
      setmessage(listofcurrentmessage);
      setLoading(false);
    }
  }, [currentmessagestatus, listofcurrentmessage]);

  useEffect(() => {
    if (chatinfo) {
      set_Chatname(chatinfo.name);
      setfirstname(chatinfo.firstname);
      if (chatinfo.photolink) {
        set_Chatphoto(chatinfo.photolink);
      }
    }
  }, [chatinfo]);

  const messagelist = () => {
    if (loading === false) {
      let ids = creatorid.split(",");
      if (message.length > 0) {
        return (
          <div
            className="space-y-3"
            ref={msgListref}
          >
            {message.map((value: {id: string, coin: boolean, content: string, date: string, photolink: string, name: string}) => {
              const isUser = value.id === userid;
              const messageTime = new Date(Number(value.date)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              
                if (value.coin) {
                  return (
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
                    }`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span className="font-semibold">{isUser ? 'You sent' : `${value.name} sent`}</span>
                      </div>
                      <p className="text-lg font-bold mt-1">${value.content}</p>
                      <p className="text-xs opacity-70 mt-1">{messageTime}</p>
                    </div>
                    </div>
                  );
              } else {
                  return (
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
                    <div className={`max-w-xs px-4 py-3 rounded-2xl ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-br-md' 
                        : 'bg-blue-800/50 text-white rounded-bl-md border border-blue-700/30'
                    }`}>
                      <p className="text-sm">{value.content}</p>
                      <p className="text-xs opacity-70 mt-1">{messageTime}</p>
                    </div>
                    </div>
                  );
              }
            })}
          </div>
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

  useEffect(() => {
    if (!creatorid || !userid) return;
    // Allow URLs like "<creatorid>,<clientid>" or just "<creatorid>"
    const parts = creatorid.split(",");
    const payload =
      parts.length >= 2
        ? { creatorid: parts[0], clientid: parts[1] }
        : { creatorid: parts[0], clientid: userid };

    dispatch(getchat(payload) as any);
  }, [creatorid, userid, dispatch]);

  // Socket connection and real-time message handling
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userid) return;

    // Connect user to socket
    socket.emit("online", userid);

    // Listen for new messages
    const handleLiveChat = (data: any) => {
      let ids = creatorid.split(",");
      if (ids[0] === data.data.fromid && userid === data.data.toid) {
        let info = {
          name: data.name,
          photolink: data.photolink,
          content: data.data.content,
          date: data.data.date,
          id: data.data.fromid,
          coin: data.data.coin,
        };
        setmessage((value: any) => [...value, info]);
      }
    };

    socket.on("LiveChat", handleLiveChat);

    return () => {
      socket.off("LiveChat", handleLiveChat);
    };
  }, [userid, creatorid]);

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
  //       let ids = creatorid.split(",");
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
  //     let ids = creatorid.split(",");

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

  //       //let ids = creatorid.split(",");

  //       socket.emit("message", content);
  //       setsendL(true);
  //       dispatch(
  //         send_gift({
  //           token,
  //           creatorid: ids[0],
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

  const send_chat = (text: string) => {
    if (text) {
      let reciver = creatorid.split(",");

      if (userid) {
        // Get user info from Redux store
        const profilephotolink = useSelector((state: RootState) => state.profile.photolink);
        const profilename = useSelector((state: RootState) => state.profile.firstname);
        setchatphotolink(profilephotolink);
        setchatusername(profilename);
      }

      let content = {
        fromid: userid,
        content: `${text}`,
        toid: reciver[0],
        date: Date.now().toString(),
        favourite: false,
        notify: true,
        coin: false,
      };

      // Emit message through socket
      const socket = getSocket();
      if (socket) {
        socket.emit("message", content);
      }
      
      let chats = {
        name: chatusername,
        content: content.content,
        date: content.date,
        photolink: chatphotolink,
        id: content.fromid,
        coin: false,
      };

      setmessage((value: any) => [...value, chats]);
      settext("");
    }
  };

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
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="chat-container flex flex-col h-full">
        {/* Top bar */}
        <div className="bg-blue-800/50 backdrop-blur-sm border-b border-blue-700/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.back()}
                className="p-2 hover:bg-blue-700/50 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>
              <div className="flex items-center gap-3">
                <img
                src={Chatphoto}
                alt="profile"
                  className="w-12 h-12 rounded-full border-2 border-blue-600/50"
                onError={(e) => {
                  e.target.onerror = null;
                    e.target.src = "/icons/icons8-profile_Icon.png";
                  }}
                />
                <div>
                  <p className="font-bold text-white text-lg">{chatfirstname}</p>
                  <p className="text-sm text-blue-200">Online</p>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-blue-700/50 rounded-full transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-blue-700/50 rounded-full transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            </button>
              <DropdownMenu />
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="chat-content flex-1 overflow-y-auto p-4 bg-transparent">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <PacmanLoader
                color={color}
                loading={loading}
                size={35}
                aria-label="Loading Spinner"
              />
              <p className="text-sm text-center text-blue-200 mt-2">Loading messages...</p>
            </div>
          ) : (
            <div className="space-y-4">{messagelist()}</div>
          )}

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
          <img src="/icons/icons8.png" alt="img" />
        </button>

        {/* Bottom Bar */}
        <div className="flex items-center gap-3 p-4 bg-blue-800/30 border-t border-blue-700/30">
          <button className="flex-shrink-0 p-2 hover:bg-blue-700/50 rounded-full transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <div className="flex items-center flex-1 px-4 py-3 bg-blue-700/50 border border-blue-600/50 rounded-full">
            <textarea
              className="flex-1 h-8 text-white placeholder-blue-300 bg-transparent outline-none resize-none"
              value={text}
              placeholder="Type a message..."
              onChange={(e) => settext(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send_chat(text);
                }
              }}
            />
            <button
              ref={emojiButtonRef}
              className="ml-2 p-1 hover:bg-blue-600/50 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>

          <button 
            onClick={() => send_chat(text)} 
            disabled={!text.trim()}
            className="flex-shrink-0 p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
