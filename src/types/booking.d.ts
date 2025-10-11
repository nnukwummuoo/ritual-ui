interface Request {
    creator_portfoliio_Id: string;
    date: string;
    time: string;
    [key: string]: any; // fallback for other props
}
  
export interface BookingState {
    bookingmessage: string;
    bookingstats: "idle" | "loading" | "succeeded" | "failed";
    requeststats: "idle" | "loading" | "succeeded" | "failed";
    requestmessage: string;
    requests: Request[];
    cancelmessage: string;
    cancelstats: "idle" | "loading" | "succeeded" | "failed";
    bookingnote: any | null;
    notifymessage: string;
    notifystats: "idle" | "loading" | "succeeded" | "failed";
    acceptmessage: string;
    accepstats: "idle" | "loading" | "succeeded" | "failed";
    acceptedList: Request[];
    acceptedReqstat: "idle" | "loading" | "succeeded" | "failed";
    acceptedReqMes: string;
    paystats: "idle" | "loading" | "succeeded" | "failed";
    paymessage: string;
    Allrequest: Request[];
    allrequest_stats: "idle" | "loading" | "succeeded" | "failed";
    allrequestmessage: string;
    privatecallData: any[];
    rejectedCall: any | null;
  }