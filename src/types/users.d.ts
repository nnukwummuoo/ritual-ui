export interface RegisterState {
    status: string;
    error: string | null;
    verifystatus: string;
    userID: string;
    compstats: string;
    message: string;
    logedin: boolean;
    refreshtoken: string;
    accesstoken: string;
    logstats: string;
    email: string;
    password: string;
    forgetpassstate: string;
    conpasswordstate: string;
    chagepassword: string;
    modelId?: string;
    creator_listing?: boolean;
  }
  
  interface RegisterPayload {
    email: string;
    password: string;
  }
  
  interface ApiResponse {
    message: string;
    id?: string;
    token?: string;
    accessToken?: string;
    modelId?: string;
    creator_listing?: boolean;
  }