export interface ChatInfo {
    // define properties if known, or use `Record<string, any>` as fallback
    [key: string]: any;
  }
  
  export interface MessageNotification {
    photolink: string;
    username: string;
    content: string;
    messagecount: number;
    fromid: string;
    toid: string;
    date: string;
    online: boolean;
  }
  
  export interface MessageState {
    currentmessagestatus: string;
    listofcurrentmessage: any[];
    msgnitocations: MessageNotification[];
    lastmessage: string;
    msgnotifystatus: string;
    recentmsg: any[];
    Allmsg: MessageNotification[];
    mymessagenotifystatus: string;
    messageupdatestatus: string;
    giftstats: string;
    giftmessage: string;
    chatinfo: ChatInfo;
    video_call_message: string;
    video_call_data: any;
    calling: boolean;
    spd_call: any;
    offer: any;
    rejectAnswer: any;
  }
  