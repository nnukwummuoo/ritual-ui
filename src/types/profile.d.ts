export interface Profile {
  userId: string;
  accessToken?: string;
  firstname: string;
  lastname: string;
  email: string;
  username: string;
  active: boolean;
  State: string;
  country: string;
  balance: string;
  admin: boolean;
  witdrawable: string;
  creator: string;
  creator_portfolio_id: string | null;
  creatorphotolink: string | null;
  creatorname: string | null;
  photolink: string | null;
  bio: string | null;
  creator_verified: boolean;
  emailnote: boolean;
  pushnote: boolean;
  /** ISO date string when the profile/user was created. Optional; set by getprofile reducer. */
  createdAt?: string | null;
}

export interface ProfileState extends Profile {
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;

  // History
  history_stats: "idle" | "loading" | "succeeded" | "failed";
  history_message: string;
  historys: any;

  monthly_history_stats: "idle" | "loading" | "succeeded" | "failed";
  monthly_history_messege: string;
  monthly: any[];

  // Deposit
  deposit_stats: "idle" | "loading" | "succeeded" | "failed";
  deposit_message: string;

  // Follow / Unfollow
  follow_stats: "idle" | "loading" | "succeeded" | "failed";
  unfollow_stats: "idle" | "loading" | "succeeded" | "failed";
  getfollow_stats: "idle" | "loading" | "succeeded" | "failed";
  getfollow_data: any;
  fllowmsg: string;

  // Exclusive
  postexIMG: string;
  thumbimg: string;
  posteximgStats: "idle" | "loading" | "succeeded" | "failed";
  postexstats: "idle" | "loading" | "succeeded" | "failed";
  buyexstats: "idle" | "loading" | "succeeded" | "failed";
  deleteexstats: "idle" | "loading" | "succeeded" | "failed";
  collectionstats: "idle" | "loading" | "succeeded" | "failed";
  deletecolstats: "idle" | "loading" | "succeeded" | "failed";
  listofcontent: any[];
  listofcrush: any[];
  thumbdelstats: "idle" | "loading" | "succeeded" | "failed";

  // Account
  deleteaccstats: "idle" | "loading" | "succeeded" | "failed";
  listofblockuser: any[];
  blockuserstats: "idle" | "loading" | "succeeded" | "failed";
  removeblockstats: "idle" | "loading" | "succeeded" | "failed";
  updatesettingstats: "idle" | "loading" | "succeeded" | "failed";

  // Notifications
  lastnote: number;
  lastmessagenote: number;

  // Search
  searchstats: "idle" | "loading" | "succeeded" | "failed";
  search_users: any[];

  // Misc
  testmsg: string;
  closedraw: boolean;

  // Ratings (5-star rating system)
  ratings: any[];
  ratings_stats: "idle" | "loading" | "succeeded" | "failed";
  ratings_message: string;
  totalRatings: number;
  averageRating: number;
  ratingCounts: any;

  // Fan ratings (ratings received by fans from creators)
  fanRatings: any[];
  fanRatings_stats: "idle" | "loading" | "succeeded" | "failed";
  fanRatings_message: string;
  totalFanRatings: number;
  averageFanRating: number;
  fanRatingCounts: any;
}

interface Notification {
  _id: string;
  userid: string;
  message: string;
  seen: boolean;
  createdAt: string;
}

interface NotificationsData {
  notifications: Notification[];
}