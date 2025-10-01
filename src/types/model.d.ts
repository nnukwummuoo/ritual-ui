export interface ModelState {
    modelpoststatus: string;
    message: string;
    mymodel: any[];
    mymodelstatus: string;
    modelbyid: Record<string, any>;
    modelbyidstatus: string;
    modelupdatestatus: string;
    modeldeletestatus: string;
    unverifiedhoststatus: string;
    Listofunverifiedhost: any[];
    verifymodelstatus: string;
    rejectmodelstatus: string;
    ListofLivehost: any[];
    Listofhoststatus: string;
    reviewstats: string;
    reviewmessage: string;
    getreviewstats: string;
    getreviewmessage: string;
    reviewList: any[];
    review_delete_stats: string;
    review_delete_message: string;
    addcrush_stats: string;
    addcrush_message: string;
    getcrush_stats: string;
    getcrush_message: string;
    delete_msg_stats: string;
    delete_msg_message: string;
    remove_crush_stats: string;
    remove_crush_message: string;
    deletmodeImage_stats: string;
    exclusive_idphoto: string;
    exclusive_holdphoto: string;
    exclusive_ids_stats: string;
    exclusive_docs_stats: string;
    delete_docs_stats: string;
}  

interface CreateModelPayload {
    userid: string;
    token: string;
    name: string;
    age: number;
    location: string;
    price: number;
    duration: string;
    bodytype: string;
    smoke: boolean;
    drink: boolean;
    interestedin: string;
    height: number;
    weight: number;
    discription: string;
    gender: string;
    timeava: string;
    daysava: string;
    hosttype: string;
    photolink: File[];
}
  

/** Payload for updating an existing model */
export interface UpdateModelPayload {
    age: number;
    location: string;
    price: number;
    duration: string;
    bodytype: string;
    smoke: boolean;
    drink: boolean;
    interestedin: string;
    height: number;
    weight: number;
    description: string;
    gender: string;
    timeava: string;
    daysava: string;
    hosttype: string;
    hostid: string;
    token: string;
    photolink: File[];
    photocount: number;
  }
  
  /** Payload for deleting a model */
  export interface DeleteModelPayload {
    documentlink: string[];
    photolink: string[];
    hostid: string;
    token: string;
    photocount: number;
    docCount: number;
    oldlink: any
  }
  
  /** Payload for uploading exclusive docs */
  export interface PostExclusiveDocsPayload {
    userid: string;
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    country: string;
    city: string;
    address: string;
    documentType: string;
    idexpire: string;
    idPhotofile: File | null;
    holdingIdPhotofile: File | null;
  }
  
  /** Payload for deleting exclusive ids */
  export interface DeleteExclusiveIdsPayload {
    file: string[]; // or number[] if only indices
  }
  
  /** Payload for post exclusive ids */
  export interface PostExclusiveIdsPayload {
    idPhotofile: File | null;
    holdingIdPhotofile: File | null;
  }
  
  /** Generic request payload with token */
  export interface TokenPayload {
    token: string;
    userid?: string;
  }
  
  /** For review */
  export interface ReviewPayload {
    hostid: string;
    token: string;
    review: string;
  }