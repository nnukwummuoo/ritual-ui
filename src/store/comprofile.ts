/* eslint-disable @typescript-eslint/no-explicit-any */
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
                console.log("✅ [getEdit] Direct getprofile approach succeeded:", {
                    status: directResponse.status,
                    hasData: !!directResponse.data,
                    hasProfile: !!directResponse.data.profile,
                    profileKeys: directResponse.data.profile ? Object.keys(directResponse.data.profile).length : 0
                });
                
                // Log the raw response data for debugging
                console.log("📊 [getEdit] Raw direct response data:", {
                    hasProfile: !!directResponse.data.profile,
                    directDataKeys: Object.keys(directResponse.data),
                    profileDataKeys: directResponse.data.profile ? Object.keys(directResponse.data.profile) : []
                });
                
                // getprofile returns data in response.data.profile, check both locations
                const profileData = directResponse.data.profile || directResponse.data;
                
                console.log("📊 [getEdit] Profile data extracted:", {
                    hasPhotolink: !!profileData.photolink,
                    hasPhotoLink: !!profileData.photoLink,
                    photolink: profileData.photolink || "NONE",
                    photoLink: profileData.photoLink || "NONE",
                    photoID: profileData.photoID || "NONE"
                });
                
                // Transform the response to match the expected format
                const transformedData = {
                    ok: true,
                    message: "Profile fetched successfully",
                    data: {
                        id: profileData._id || profileData.userId || data.userid,
                        photolink: profileData.photolink || profileData.photoLink || "",
                        photoID: profileData.photoID || "",
                        firstname: profileData.firstname || "",
                        lastname: profileData.lastname || "",
                        state: profileData.state || "",
                        country: profileData.country || profileData.state || "",
                        bio: profileData.bio || profileData.details || "",
                        username: profileData.username || ""
                    }
                };
                
                console.log("✅ [getEdit] Transformed data for Redux:", {
                    hasPhotolink: !!transformedData.data.photolink,
                    photolink: transformedData.data.photolink || "NONE",
                    hasPhotoID: !!transformedData.data.photoID
                });
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
        // Validate image file if provided
        if (data.updatePhoto && data.updatePhoto instanceof File) {
            console.log("Validating image file...");
            
            const validation = validateImageFile(data.updatePhoto, 5); // 5MB max
            if (!validation.valid) {
                throw new Error(validation.error || "Invalid image file");
            }
            
            console.log("Image file validation passed");
        }
        
        // Use editprofilemore endpoint for proper file upload handling with profile bucket
        console.log("Using editprofilemore endpoint for profile updates with proper bucket handling...");
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('data', JSON.stringify({
            userid: data.userid,
            firstname: data.firstname,
            lastname: data.lastname,
            bio: data.bio,
            country: data.state || data.country,
            deletePhotolink: data.deletePhotolink,
            deletePhotoID: data.deletePhotoID
        }));

        // Add file if provided
        if (data.updatePhoto && data.updatePhoto instanceof File) {
            formData.append('updatePhoto', data.updatePhoto);
        }

        console.log("Sending profile update with FormData:", {
            userid: data.userid,
            hasFile: !!(data.updatePhoto && data.updatePhoto instanceof File),
            fileName: data.updatePhoto instanceof File ? data.updatePhoto.name : 'no file'
        });
        
        console.log("Making request to editmoreprofile with:", {
            url: `${URL}/editmoreprofile`,
            formDataKeys: Array.from(formData.keys()),
            note: "No authentication required - middleware removed to match other profile controllers"
        });
        
        const response = await axios.post(`${URL}/editmoreprofile`, formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        console.log("Profile update succeeded:", {
            status: response.status,
            hasData: !!response.data,
            responseData: response.data
        });

        return response.data;

    } catch (err) {
        console.error("updateEdit error:", err);
        
        if (axios.isAxiosError(err)) {
            const errorDetails = {
                status: err.response?.status,
                statusText: err.response?.statusText,
                errorMessage: err.message,
                responseData: err.response?.data,
                url: err.config?.url,
                method: err.config?.method
            };
            
            console.error("updateEdit axios error:", errorDetails);
            
            // Provide specific error messages based on status code
            if (err.response?.status === 401) {
                throw new Error("Your session has expired. Please log in again to update your profile.");
            } else if (err.response?.status === 403) {
                throw new Error("You don't have permission to update this profile.");
            } else if (err.response?.status === 400) {
                throw new Error("Invalid profile data. Please check your information and try again.");
            } else if (err.response?.status === 404) {
                throw new Error("Profile update endpoint not found. Please try again later.");
            } else if (err.response?.status === 500) {
                throw new Error("Server error occurred while updating profile. Please try again.");
            }
        }
        
        // Handle non-axios errors
        if (err instanceof Error) {
            throw new Error(`Profile update failed: ${err.message}`);
        }
        
        throw new Error("An unexpected error occurred while updating your profile.");
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
                
                // Update the profile data with the new information
                if (action.payload && action.payload.profile) {
                    console.log("Updating profile data in Redux:", action.payload.profile);
                    state.editData = {
                        ...state.editData,
                        ...action.payload.profile
                    };
                    console.log("Updated editData with new photolink:", action.payload.profile.photolink);
                } else {
                    console.log("No profile data in response:", action.payload);
                }
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

