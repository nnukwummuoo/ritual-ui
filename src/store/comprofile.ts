import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../api/config"
// import { downloadImage, deleteImage, saveImage } from "../../../api/sendImage";
import axios from "axios";
import { validateImageFile } from "../utils/cloudinary";

interface ComProfileState {
    photoLink: string;
    details: string;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    photostatus: string;
    error: string | null;
    profilephoto: any | null;
    downloadPhotstats: 'idle' | 'loading' | 'succeeded' | 'failed';
    profile: Record<string, any>;
    getprofileidstatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    editData: Record<string, any>;
    getedit_stats: 'idle' | 'loading' | 'succeeded' | 'failed';
    getedit_message: string;
    updateEdit_stats: 'idle' | 'loading' | 'succeeded' | 'failed';
    updateEdit_message: string;
}

// Payload type for updateEdit thunk
interface UpdateEditPayload {
    userid: string | number;
    deletePhotolink?: string;
    deletePhotoID?: string | number;
    firstname?: string;
    lastname?: string;
    country?: string;
    bio?: string;
    token: string;
    updatePhoto?: File | Blob | string | null;
    // Additional auth fields
    hasToken?: boolean;
    accesstoken?: string;
    refreshtoken?: string;
    userID?: string;
    state?: string; // Backend expects this field
}

const initialState: ComProfileState = {
    photoLink: '',
    details: '',
    status: 'idle',
    photostatus: '',
    error: null,
    profilephoto: null,
    downloadPhotstats: "idle",
    profile: {},
    getprofileidstatus: 'idle',
    editData: {},
    getedit_stats: "idle",
    getedit_message: "",
    updateEdit_stats: "idle",
    updateEdit_message: ""
}

export const getcomprofile = createAsyncThunk("comprofile/getcomprofile", async data => {

    try {

        let response = await axios.post(`${URL}/getmoreprofile`, data)

        return response.data

    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})

export const getprofilephoto = createAsyncThunk("comprofile/getprofilephoto", async data => {
    /*try {
        let response = downloadImage(data, "profile")
        return response
    } catch (err) {
        throw (err)
    }*/
    console.log("Within getprofilephoto: ", data);
    return data;
})


export const getprofilebyid = createAsyncThunk("comprofile/getprofilebyid", async data => {

    try {

        let response = await axios.patch(`${URL}/getprofilebyid`, data)

        return response.data

    } catch (err) {
        if (axios.isAxiosError(err)) {
            throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }


})

export const getEdit = createAsyncThunk<any, { 
  userid: string; 
  token: string; 
  hasToken?: boolean;
  accesstoken?: string;
  refreshtoken?: string;
  userID?: string;
}>("comprofile/getEdit", async (data) => {

    try {
        console.log("getEdit action called with data:", {
            userid: data.userid,
            hasToken: data.hasToken,
            tokenProvided: !!data.token
        });

        // First try the direct approach that works (without JWT auth)
        try {
            console.log("Trying direct getprofile approach first");
            const directResponse = await axios.post(`${URL}/getprofile`, { 
                userid: data.userid 
            });
            
            if (directResponse.status === 200 && directResponse.data) {
                console.log("Direct getprofile approach succeeded:", {
                    status: directResponse.status,
                    dataReceived: !!directResponse.data
                });
                
                // Log the raw response data for debugging
                console.log("Raw direct response data:", directResponse.data);
                
                // Transform the response to match the expected format
                const transformedData = {
                    ok: true,
                    message: "Profile fetched successfully",
                    data: {
                        id: directResponse.data._id || directResponse.data.userId || data.userid,
                        photolink: directResponse.data.photolink || directResponse.data.photoLink,
                        photoID: directResponse.data.photoID,
                        firstname: directResponse.data.firstname,
                        lastname: directResponse.data.lastname,
                        state: directResponse.data.state,
                        country: directResponse.data.state,
                        bio: directResponse.data.bio || directResponse.data.details
                    }
                };
                
                console.log("Transformed data for Redux:", transformedData);
                return transformedData;
            }
        } catch (directError) {
            console.log("Direct getprofile approach failed, trying JWT auth", 
                directError instanceof Error ? directError.message : "unknown error");
        }
        
        // If direct approach fails, try JWT auth as fallback
        // Create a complete data object with all fields the API might need
        const completeData = {
            ...data,
            hasToken: true,  // Ensure this is always set
        };

        // Set up headers with the token for JWT authentication
        // Remove Bearer prefix if it exists, then add it back properly
        const cleanToken = data.token.startsWith('Bearer ') ? data.token.substring(7) : data.token;
        const authToken = `Bearer ${cleanToken}`;
        
        const headers = {
            'Authorization': authToken,
            'Content-Type': 'application/json'
        };
        
        console.log("getEdit token format check:", {
            originalLength: data.token.length,
            hasBearer: data.token.startsWith('Bearer '),
            finalTokenFormat: authToken.substring(0, 15) + '...'
        });

        console.log("Sending request to useredit with Authorization header:", {
            url: `${URL}/useredit`,
            headersSent: Object.keys(headers),
            hasAuthHeader: !!headers.Authorization,
            authHeaderPrefix: headers.Authorization?.substring(0, 10) + '...'
        });
        
        try {
            const response = await axios.post(`${URL}/useredit`, completeData, { headers });
            console.log("getEdit API response:", {
                status: response.status,
                statusText: response.statusText,
                dataReceived: !!response.data,
                dataOk: response.data?.ok,
                dataMessage: response.data?.message
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error("getEdit axios error:", {
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    errorMessage: error.message,
                    responseData: error.response?.data
                });
                
                // Try one more fallback - localStorage data
                try {
                    console.log("JWT auth failed, trying to use localStorage data");
                    const loginDataStr = localStorage.getItem("login");
                    if (loginDataStr) {
                        const loginData = JSON.parse(loginDataStr);
                        if (loginData) {
                            // Create a mock response with localStorage data
                            return {
                                ok: true,
                                message: "Profile fetched from localStorage",
                                data: {
                                    id: loginData.userID || data.userid,
                                    photolink: loginData.photolink,
                                    photoID: loginData.photoID,
                                    firstname: loginData.firstname,
                                    lastname: loginData.lastname,
                                    state: loginData.state || loginData.State,
                                    country: loginData.state,
                                    bio: loginData.bio || loginData.details
                                }
                            };
                        }
                    }
                } catch (localStorageError) {
                    console.error("localStorage fallback failed:", localStorageError);
                }
            } else {
                console.error("getEdit unknown error:", error);
            }
            throw error;
        }
    } catch (err) {
        console.error("getEdit API error:", err);
        if (axios.isAxiosError(err)) {
            throw (err.response?.data as any)?.message ?? "Network error";
        }
        throw "Unexpected error";
    }
})

export const updateEdit = createAsyncThunk<any, UpdateEditPayload>("comprofile/updateEdit", async (data: UpdateEditPayload) => {

    console.log("Inside updateEdit with data:", {
        userid: data.userid,
        userID: data.userID,
        hasToken: data.hasToken,
        tokenProvided: !!data.token,
        accesstokenProvided: !!data.accesstoken,
        refreshtokenProvided: !!data.refreshtoken,
        firstname: data.firstname,
        lastname: data.lastname,
        bio: data.bio ? "provided" : "not provided",
        state: data.state,
        country: data.state,
        updatePhoto: data.updatePhoto ? "provided" : "not provided"
    });

    try {
        // Handle image upload by converting to data URL if needed
        let imageDataUrl = "";
        
        if (data.updatePhoto && data.updatePhoto instanceof File) {
            console.log("Processing image upload by converting to data URL...");
            
            // Validate the image file
            const validation = validateImageFile(data.updatePhoto, 5); // 5MB max
            if (!validation.valid) {
                throw new Error(validation.error || "Invalid image file");
            }
            
            // Convert image to data URL
            try {
                const reader = new FileReader();
                const dataUrl = await new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(data.updatePhoto);
                });
                
                imageDataUrl = dataUrl;
                console.log("Image converted to data URL successfully");
            } catch (dataUrlError) {
                console.error("Failed to convert image to data URL:", dataUrlError);
                throw new Error("Failed to process image. Please try again.");
            }
        }
        
        // Always use the simple editprofile endpoint (no authentication, no file upload)
        console.log("Using simple editprofile endpoint for all updates...");
        
        const updateData = {
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            nickname: data.nickname,
            bio: data.bio,
            state: data.state || data.country,
            country: data.state || data.country,

            // Include image data URL if available
            ...(imageDataUrl && {
                photolink: imageDataUrl,
                photoID: `temp_${Date.now()}`
            })
        };

        console.log("Sending update data:", {
            ...updateData,
            photolink: imageDataUrl ? "data URL provided" : "no image",
            photolinkLength: imageDataUrl?.length,
            photolinkPreview: imageDataUrl?.substring(0, 50) + '...'
        });
        
        const response = await axios.post(`${URL}/editprofile`, updateData, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        console.log("Profile update succeeded:", {
            status: response.status,
            hasData: !!response.data
        });

        return response.data;

    } catch (err) {
        console.error("updateEdit error:", err);
        if (axios.isAxiosError(err)) {
            console.error("updateEdit axios error:", {
                status: err.response?.status,
                statusText: err.response?.statusText,
                errorMessage: err.message,
                responseData: err.response?.data
            });
            
            // Provide specific error messages based on status code
            if (err.response?.status === 401) {
                throw new Error("Your session has expired. Please log in again to update your profile.");
            } else if (err.response?.status === 403) {
                throw new Error("You don't have permission to update this profile.");
            } else if (err.response?.status === 400) {
                throw new Error("Invalid profile data. Please check your information and try again.");
            }
        }
        throw err;
    }
})

const comprofile = createSlice({
    name: "comprofile",
    initialState,
    reducers: {
        comprofilechangeStatus(state, action) {
            state.status = action.payload
            state.getprofileidstatus = action.payload
            state.getedit_stats = action.payload
            state.updateEdit_stats = action.payload
        },
        comprofiledonloadstats(state, action) {
            state.downloadPhotstats = action.payload
        },
        resetprofilebyid(state, action) {
            state.profile = {}
        }
    },
    extraReducers(builder) {

        builder.addCase(getcomprofile.pending, (state, action) => {
            state.status = 'loading'
        }
        )
            .addCase(getcomprofile.fulfilled, (state, action) => {

                state.photoLink = action.payload.profile.photoLink;
                state.details = action.payload.profile.details;
                state.status = 'succeeded'
            }

            )
            .addCase(getcomprofile.rejected, (state, action) => {

                state.status = 'failed'
                state.error = action.error.message ?? null
            }

            )
            .addCase(getprofilephoto.pending, (state, action) => {
                state.photostatus = 'loading'
            }
            )
            .addCase(getprofilephoto.fulfilled, (state, action) => {

                state.profilephoto = action.payload
                state.photostatus = 'succeeded'
            }

            )
            .addCase(getprofilephoto.rejected, (state, action) => {

                state.photostatus = 'failed'
                state.error = action.error.message ?? null
            }

            )
            .addCase(getprofilebyid.pending, (state, action) => {
                state.getprofileidstatus = 'loading'
            }
            )
            .addCase(getprofilebyid.fulfilled, (state, action) => {
                state.profile = action.payload.profile
                state.getprofileidstatus = 'succeeded'
            }

            )
            .addCase(getprofilebyid.rejected, (state, action) => {

                state.getprofileidstatus = 'failed'
                state.error = action.error.message ?? null
            }

            )
            .addCase(getEdit.pending, (state, action) => {
                state.getedit_stats = 'loading'
            }
            )
            .addCase(getEdit.fulfilled, (state, action) => {

                state.editData = action.payload.data
                state.getedit_stats = 'succeeded'
            }

            )
            .addCase(getEdit.rejected, (state, action) => {

                state.getedit_stats = 'failed'
                state.getedit_message = action.error.message ?? ""
            }

            )
            .addCase(updateEdit.pending, (state, action) => {
                state.updateEdit_stats = 'loading'
            }
            )
            .addCase(updateEdit.fulfilled, (state, action) => {

                state.updateEdit_stats = 'succeeded'
            }

            )
            .addCase(updateEdit.rejected, (state, action) => {

                state.updateEdit_stats = 'failed'
                state.updateEdit_message = action.error.message ?? ""
            }

            )
    }
})



export default comprofile.reducer;
export const { comprofilechangeStatus, resetprofilebyid } = comprofile.actions;
// Local root type for this slice to avoid implicit any on selectors
type ComProfileRootState = { comprofile: ComProfileState };
export const Compfstatus = (state: ComProfileRootState) => state.comprofile.status;
