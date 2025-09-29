export interface Profile {
  userId: string;
  firstname: string;
  lastname: string;
  email: string;
  nickname: string;
  active: boolean;
  State: string;
  country: string;
  balance: string;
  admin: boolean;
  witdrawable: string;
  model: string;
  modelID: string | null;
  modelphotolink: string | null;
  modelname: string | null;
  photolink: string | null;
  bio: string | null;
  exclusive_verify: boolean;
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
}