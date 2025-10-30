"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { AnyAction } from "redux";
import PacmanLoader from "react-spinners/RingLoader";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { URL as API_URL } from "@/api/config";

import profileIcon from "@/icons/icons8-profile_Icon.png";
// Import used for the profile image upload button in JSX
import uploadIcon from "@/icons/uploadIcon.svg"; // eslint-disable-line

import {
  getEdit,
  comprofilechangeStatus,
  updateEdit,
} from "@/store/comprofile";
import { getallpost } from "@/store/post";

// ✅ Update RootState type according to your Redux store
import { RootState } from "@/store/store";
import { countryList } from "@/components/CountrySelect/countryList";
import HeaderBackNav from "@/navs/HeaderBackNav";
import { Gennavigation } from "@/components/navs/Gennav";

// Track API request status to prevent duplicate calls
const apiRequestTracker = {
  getEditRequested: false,
  resetGetEditRequested: () => {
    apiRequestTracker.getEditRequested = false;
  }
};

const EditProfile: React.FC = () => {
  // Get user ID from route parameter
  const params = useParams();
  const routeUserId = params?.userid as string;
  
  // Get authentication data from Redux
  // const isLoggedIn = useSelector((state: RootState) => state.register.logedin); // Unused for now
  const loggedInUserId = useSelector((state: RootState) => state.register.userID);
  const token = useSelector((state: RootState) => state.register.refreshtoken);

  // Get profile data from Redux store
  const data = useSelector((state: RootState) => state.comprofile.editData);
  const getedit_stats = useSelector(
    (state: RootState) => state.comprofile.getedit_stats
  );
  const getedit_message = useSelector(
    (state: RootState) => state.comprofile.getedit_message
  );
  const updateEdit_stats = useSelector(
    (state: RootState) => state.comprofile.updateEdit_stats
  );
  const updateEdit_message = useSelector(
    (state: RootState) => state.comprofile.updateEdit_message
  );

  // Local state for UI
  const [loading, setLoading] = useState(true);
  const [color] = useState("#fff");
  const [showEdit, setShowEdit] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();

  const ref = useRef<HTMLInputElement | null>(null);
  const dataFetchedRef = useRef(false);

  // Form placeholders (will be replaced with actual data)
  const [firstnamepl, setFirstnamepl] = useState("first name");
  const [lastnamepl, setLastnamepl] = useState("last name");
  const [countrypl, setCountrypl] = useState("country");
  const [biopl, setBiopl] = useState("about me");
  const [usernamepl, setUsernamepl] = useState("username");

  // Form input values
  const [profileimg, setProfileimg] = useState<string>(profileIcon.src);
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [username, setUsername] = useState("");
  const [click, setclick] = useState(false);

  // Photo update tracking
  const [updatePhoto, setUpdatePhoto] = useState<File | undefined>();
  const [deletePhotolink, setDeletePhotolink] = useState<string | undefined>();
  const [deletePhotoID, setDeletePhotoID] = useState<string | undefined>();

  // Username validation
  const [usernameError, setUsernameError] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameValid, setUsernameValid] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(""); // "valid", "invalid", "checking", ""

  // Function to check username uniqueness
  const checkUsernameUniqueness = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError("");
      setUsernameValid(false);
      setUsernameStatus("");
      return false;
    }

    // Validate username format: 3-15 characters, only letters, numbers, and underscores
    const usernameRegex = /^[a-z0-9_]{3,15}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError("Username must be 3-15 characters, lowercase letters, numbers, and underscores only");
      setUsernameValid(false);
      setUsernameStatus("invalid");
      return false;
    }

    setIsCheckingUsername(true);
    setUsernameError("");
    setUsernameStatus("checking");
    setUsernameValid(false);

    try {
      const response = await axios.post(`${API_URL}/checkusername`, {
        username: `@${username}`, // Add @ prefix for database check
        currentUserId: routeUserId // Exclude current user from check
      });

      if (response.data.available) {
        setUsernameError("");
        setUsernameValid(true);
        setUsernameStatus("valid");
        return true;
      } else {
        setUsernameError("Username is already taken");
        setUsernameValid(false);
        setUsernameStatus("invalid");
        return false;
      }
    } catch (error) {
      console.error("Error checking username:", error);
      setUsernameError("Error checking username availability");
      setUsernameValid(false);
      setUsernameStatus("invalid");
      return false;
    } finally {
      setIsCheckingUsername(false);
    }
  };

  // Check authorization
  useEffect(() => {
    // Helper function to get token and user data from localStorage if not in Redux
  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars
  const getLocalStorageData = () => {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          console.log("localStorage login data:", {
            hasUserID: !!data?.userID,
            hasToken: !!(data?.refreshtoken || data?.accesstoken),
            tokenType: data?.refreshtoken ? "refreshtoken" : (data?.accesstoken ? "accesstoken" : "none")
          });
          return {
            token: data?.refreshtoken || data?.accesstoken || "",
            userID: data?.userID || "",
            rawData: data
          };
        }
      } catch (error) {
        console.error("Error retrieving data from localStorage:", error);
      }
      return { token: "", userID: "", rawData: null };
    };

    const getLocalUserId = () => {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const data = JSON.parse(raw);
          return data?.userID || "";
        }
      } catch (error) {
        console.error("Error retrieving userID from localStorage:", error);
      }
      return "";
    };

    const effectiveUserId = loggedInUserId || getLocalUserId();
    
    // Check if user is authorized to edit this profile
    if (routeUserId && effectiveUserId) {
      if (routeUserId === effectiveUserId) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        setErrorMessage("You are not authorized to edit this profile");
        setLoading(false);
      }
    }
  }, [routeUserId, loggedInUserId]);

  // Helper function to get token and user data from localStorage if not in Redux
  const getLocalStorageData = () => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        console.log("localStorage login data:", {
          hasUserID: !!data?.userID,
          hasToken: !!(data?.refreshtoken || data?.accesstoken),
          tokenType: data?.refreshtoken ? "refreshtoken" : (data?.accesstoken ? "accesstoken" : "none")
        });
        return {
          token: data?.refreshtoken || data?.accesstoken || "",
          userID: data?.userID || "",
          rawData: data
        };
      }
    } catch (error) {
      console.error("Error retrieving data from localStorage:", error);
    }
    return { token: "", userID: "", rawData: null };
  };
  
  // Get auth token from cookie if available
  const getCookieToken = () => {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('auth_token=')) {
        return cookie.substring('auth_token='.length, cookie.length);
      }
      if (cookie.startsWith('session=')) {
        return cookie.substring('session='.length, cookie.length);
      }
    }
    return "";
  };
  
  // Debug the actual token value to check its format
  const debugToken = () => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.accesstoken) {
          console.log("Token structure check:", {
            tokenType: typeof data.accesstoken,
            tokenLength: data.accesstoken.length,
            firstChars: data.accesstoken.substring(0, 10) + '...',
            isJWT: data.accesstoken.split('.').length === 3,
            hasBearer: data.accesstoken.startsWith('Bearer ')
          });
          
          // Decode the JWT token to see its contents (without verification)
          try {
            const tokenParts = data.accesstoken.split('.');
            if (tokenParts.length === 3) {
              const header = JSON.parse(atob(tokenParts[0]));
              const payload = JSON.parse(atob(tokenParts[1]));
              console.log("JWT token contents:", {
                header,
                payload,
                hasUserInfo: !!payload.UserInfo,
                userId: payload.UserInfo?.userId,
                username: payload.UserInfo?.username,
                exp: payload.exp ? new Date(payload.exp * 1000).toISOString() : 'none'
              });
            }
          } catch (decodeError) {
            console.error("Error decoding JWT token:", decodeError);
          }
        }
      }
      }
    } catch (e) {
      console.error("Error checking token format:", e);
    }
  };
  
  // Call the debug function
  debugToken();
  
  // Function to fetch user profile data directly without JWT authentication
  const fetchProfileDirectly = async (userId: string) => {
    try {
      console.log("Attempting to fetch profile directly without JWT...");
      
      // Try the getprofile endpoint which might not require JWT
      try {
        const response = await axios.post(`${API_URL}/getprofile`, { 
          userid: userId 
        });
        
        if (response.status === 200 && response.data) {
          console.log("Direct profile fetch succeeded:", {
            status: response.status,
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : []
          });
          
          // Log the actual data structure for debugging
          console.log("📊 [EditProfile] Direct API response data:", {
            hasProfile: !!response.data.profile,
            profileKeys: response.data.profile ? Object.keys(response.data.profile) : [],
            hasUsername: !!response.data.profile?.username,
            hasBio: !!response.data.profile?.bio,
            username: response.data.profile?.username,
            bio: response.data.profile?.bio
          });
          
          // If we got profile data, use it to populate the form
          if (response.data) {
            // Check if data is nested in a profile object
            const profileData = response.data.profile || response.data;
            console.log("Using profile data:", profileData);
            // Set profile image if available
            if (profileData.photolink || profileData.photoLink) {
              setProfileimg(profileData.photolink || profileData.photoLink);
              setDeletePhotolink(profileData.photolink || profileData.photoLink);
              setDeletePhotoID(profileData.photoID);
            }
            
            // Set form values
            if (profileData.firstname) {
              setFirstnamepl(profileData.firstname);
              setFirstname(profileData.firstname);
            }
            
            if (profileData.lastname) {
              setLastnamepl(profileData.lastname);
              setLastname(profileData.lastname);
            }
            
            if (profileData.country || profileData.state) {
              const locationValue = profileData.country || profileData.state;
              setCountrypl(locationValue);
              setCountry(locationValue);
            }
            
            if (profileData.bio || profileData.details) {
              setBiopl(profileData.bio || profileData.details);
              setBio(profileData.bio || profileData.details);
            }
            
            if (profileData.username) {
              // Remove @ prefix if it exists when loading from database
              const cleanUsername = profileData.username.startsWith('@') 
                ? profileData.username.substring(1) 
                : profileData.username;
              setUsernamepl(cleanUsername);
              setUsername(cleanUsername);
            }
            
            // Show the form
            setLoading(false);
            setShowEdit(true);
            setDirectAuthVerified(true);
            return true;
          }
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log("Direct profile fetch with getprofile failed:", error.response?.status, error.response?.data);
        }
      }
      
      // Try a direct call to the controller without middleware
      try {
        const response = await axios.post(`${API_URL}/api/profile/direct`, { 
          userid: userId 
        });
        
        if (response.status === 200 && response.data) {
          console.log("Direct API call succeeded:", {
            status: response.status,
            hasData: !!response.data,
            dataKeys: response.data ? Object.keys(response.data) : []
          });
          
          // Process response data similar to above
          // ...
          
          return true;
        }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          console.log("Direct API call failed:", error.response?.status, error.response?.data);
        }
      }
      
      return false;
    } catch (e) {
      console.error("Error in direct profile fetch:", e);
      return false;
    }
  };
  
  // We'll call this function in the useEffect below
  
  // Try to verify authentication directly with the API
  const [directAuthVerified, setDirectAuthVerified] = useState(false);

  useEffect(() => {
    const verifyAuthDirectly = async () => {
      try {
        // Get data from all possible sources
        const localData = getLocalStorageData();
        const effectiveUserId = loggedInUserId || localData.userID || routeUserId;
        
        if (!effectiveUserId) {
          console.log("No user ID available for verification");
          return;
        }
        
        console.log("Trying direct API auth verification for user:", effectiveUserId);
        
        // Try direct fetch without JWT
        const directSuccess = await fetchProfileDirectly(effectiveUserId);
        
        if (!directSuccess) {
          // If direct fetch fails, try JWT method
          try {
            const cookieToken = getCookieToken();
            // Get raw token from available sources
            const rawTokenSource = token || localData.token || cookieToken;
            
            if (rawTokenSource) {
              // Remove Bearer prefix if it exists
              const effectiveToken = rawTokenSource.startsWith('Bearer ') ? rawTokenSource.substring(7) : rawTokenSource;
              
              // Create a complete auth payload
              const directAuthPayload = {
                userid: effectiveUserId,
                userID: effectiveUserId,
                token: effectiveToken,
                accesstoken: localData.rawData?.accesstoken || "",
                refreshtoken: localData.rawData?.refreshtoken || "",
                hasToken: true
              };
              
              // Set up headers with the token for JWT authentication
              const cleanToken = effectiveToken.startsWith('Bearer ') ? effectiveToken.substring(7) : effectiveToken;
              const authToken = `Bearer ${cleanToken}`;
              
              const headers = {
                'Authorization': authToken,
                'Content-Type': 'application/json'
              };
              
              console.log("Trying JWT authentication as fallback");
              
              const response = await axios.post(`${API_URL}/useredit`, directAuthPayload, { headers });
              
              if (response.status === 200 && response.data.ok !== false) {
                console.log("JWT authentication succeeded");
                setDirectAuthVerified(true);
                
                // If we got profile data, use it to populate the form
                if (response.data.data) {
                  console.log("Using data from JWT verification to populate form");
                  const profileData = response.data.data;
                  
                  // Set profile image if available
                  if (profileData.photolink) {
                    setProfileimg(profileData.photolink);
                    setDeletePhotolink(profileData.photolink);
                    setDeletePhotoID(profileData.photoID);
                  }
                  
                  // Set form values
                  if (profileData.firstname) {
                    setFirstnamepl(profileData.firstname);
                    setFirstname(profileData.firstname);
                  }
                  
                  if (profileData.lastname) {
                    setLastnamepl(profileData.lastname);
                    setLastname(profileData.lastname);
                  }
                  
                  if (profileData.country || profileData.state) {
                    const locationValue = profileData.country || profileData.state;
                    setCountrypl(locationValue);
                    setCountry(locationValue);
                  }
                  
                  if (profileData.bio) {
                    setBiopl(profileData.bio);
                    setBio(profileData.bio);
                  }
                  
                  if (profileData.username) {
                    // Remove @ prefix if it exists when loading from database
                    const cleanUsername = profileData.username.startsWith('@') 
                      ? profileData.username.substring(1) 
                      : profileData.username;
                    setUsernamepl(cleanUsername);
                    setUsername(cleanUsername);
                  }
                  
                  // Show the form
                  setLoading(false);
                  setShowEdit(true);
                }
              }
            }
          } catch (jwtError) {
            console.log("JWT authentication failed too", jwtError instanceof Error ? jwtError.message : "unknown error");
            
            // Show the form anyway with localStorage data
      setLoading(false);
      setShowEdit(true);

            // Try to get user data from localStorage as fallback
            try {
              const raw = localStorage.getItem("login");
              if (raw) {
                const data = JSON.parse(raw);
                console.log("Using localStorage data as fallback:", {
                  hasFirstname: !!data.firstname,
                  hasLastname: !!data.lastname,
                  hasCountry: !!(data.country || data.State)
                });
                
                // Set form values from localStorage
                if (data.firstname) {
                  setFirstnamepl(data.firstname);
                  setFirstname(data.firstname);
                }
                
                if (data.lastname) {
                  setLastnamepl(data.lastname);
                  setLastname(data.lastname);
                }
                
                if (data.country || data.State) {
                  const locationValue = data.country || data.State;
                  setCountrypl(locationValue);
                  setCountry(locationValue);
                }
                
                // Profile picture may not be in localStorage
        if (data.photolink) {
          setProfileimg(data.photolink);
                }
                
                // Bio may not be in localStorage
                if (data.bio) {
                  setBiopl(data.bio);
                  setBio(data.bio);
                }
                
                // Username may not be in localStorage
                if (data.username) {
                  // Remove @ prefix if it exists when loading from localStorage
                  const cleanUsername = data.username.startsWith('@') 
                    ? data.username.substring(1) 
                    : data.username;
                  setUsernamepl(cleanUsername);
                  setUsername(cleanUsername);
                }
              }
            } catch (e) {
              console.error("Error reading from localStorage:", e);
            }
          }
        }
      } catch (error) {
        console.log("Direct API auth verification failed:", error);
        
        // Show the form anyway
        setLoading(false);
        setShowEdit(true);
      }
    };
    
    if (isAuthorized && !directAuthVerified) {
      verifyAuthDirectly();
    }
  }, [isAuthorized, token, loggedInUserId, routeUserId, directAuthVerified]);
  
  // Fetch profile data once when component mounts
  useEffect(() => {
    // Prevent duplicate API calls
    if (dataFetchedRef.current) return;
    
    // Get data from all possible sources
    const localData = getLocalStorageData();
    const cookieToken = getCookieToken();
    
    // Try all possible token sources
    const effectiveToken = token || localData.token || cookieToken;
    
    console.log("Edit profile - Token sources:", { 
      reduxToken: token ? "exists" : "missing", 
      localStorageToken: localData.token ? "exists" : "missing",
      cookieToken: cookieToken ? "exists" : "missing"
    });
    
    // Log the actual token (first few characters) for debugging
    if (effectiveToken) {
      console.log("Token preview:", effectiveToken.substring(0, 10) + "...");
    }
    
    // Only fetch if we have the required data, are authorized, and either direct auth is verified or we haven't tried yet
    if (routeUserId && effectiveToken && isAuthorized && !apiRequestTracker.getEditRequested && (directAuthVerified || !dataFetchedRef.current)) {
      apiRequestTracker.getEditRequested = true;
      dataFetchedRef.current = true;
      
      console.log("Fetching profile data for editing:", { userid: routeUserId, hasToken: !!effectiveToken });
      
      // Create a more complete authentication payload
      // Make sure we're using the raw token without Bearer prefix
      const cleanToken = effectiveToken.startsWith('Bearer ') ? effectiveToken.substring(7) : effectiveToken;
      
      const authPayload = {
        userid: routeUserId,
        token: cleanToken,
        hasToken: true,
        accesstoken: localData.rawData?.accesstoken || "",
        refreshtoken: localData.rawData?.refreshtoken || "",
        userID: localData.userID || loggedInUserId || routeUserId
      };
      
      // Log the auth payload with token info but not the actual tokens
      console.log("Sending auth payload:", {
        userid: authPayload.userid,
        userID: authPayload.userID,
        hasToken: authPayload.hasToken,
        token: authPayload.token ? "exists" : "missing",
        accesstoken: authPayload.accesstoken ? "exists" : "missing",
        refreshtoken: authPayload.refreshtoken ? "exists" : "missing"
      });
      
      // Make sure we're sending the actual token values in the request
      const finalAuthPayload = {
        ...authPayload,
        // Make sure the token is actually sent, not just a flag
        token: authPayload.token,
        accesstoken: authPayload.accesstoken,
        refreshtoken: authPayload.refreshtoken,
      };
      
      dispatch(
        getEdit(finalAuthPayload) as unknown as AnyAction
      );
      
      // Add a timeout to prevent infinite loading
      const timer = setTimeout(() => {
        if (loading) {
          setLoading(false);
          setShowEdit(true);
        }
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [routeUserId, token, isAuthorized, dispatch, loading, directAuthVerified, loggedInUserId]);

  // Handle API response for profile data fetch
  useEffect(() => {
    // Handle successful profile data fetch
    if (getedit_stats === "succeeded") {
      // Reset API status to prevent duplicate calls
      setTimeout(() => {
        dispatch(comprofilechangeStatus("idle") as unknown as AnyAction);
      }, 300);
      
      setLoading(false);
      setShowEdit(true);

      // Populate form with fetched data
      if (data) {
        console.log("Successfully fetched profile data:", data);
        
        // Extract the actual profile data from the nested structure
        const profileData = data.data || data;
        console.log("📊 [EditProfile] Extracted profile data:", {
          hasUsername: !!profileData.username,
          hasBio: !!profileData.bio,
          username: profileData.username,
          bio: profileData.bio,
          allKeys: Object.keys(profileData)
        });
        
        // Set profile image if available
        if (profileData.photolink) {
          setProfileimg(profileData.photolink);
          setDeletePhotolink(profileData.photolink);
          setDeletePhotoID(profileData.photoID);
        }
        
        // Set form placeholders with current values
        if (profileData.firstname) {
          setFirstnamepl(profileData.firstname);
          setFirstname(profileData.firstname); // Also set the actual input value
        }
        
        if (profileData.lastname) {
          setLastnamepl(profileData.lastname);
          setLastname(profileData.lastname); // Also set the actual input value
        }
        
        if (profileData.country || profileData.state) {
          const locationValue = profileData.country || profileData.state;
          setCountrypl(locationValue);
          setCountry(locationValue); // Also set the actual input value
        }
        
        if (profileData.bio) {
          setBiopl(profileData.bio);
          setBio(profileData.bio); // Also set the actual input value
        }
        
        if (profileData.username) {
          // Remove @ prefix if it exists when loading from database
          const cleanUsername = profileData.username.startsWith('@') 
            ? profileData.username.substring(1) 
            : profileData.username;
          setUsernamepl(cleanUsername);
          setUsername(cleanUsername); // Also set the actual input value
        }
      }
    }

    // Handle failed profile data fetch
    if (getedit_stats === "failed") {
      apiRequestTracker.resetGetEditRequested(); // Allow retry
      
      setTimeout(() => {
        dispatch(comprofilechangeStatus("idle") as unknown as AnyAction);
      }, 300);
      
      console.log("Edit profile data fetch failed:", getedit_message);
      
      // Show form anyway and populate with data from localStorage
      setLoading(false);
      setShowEdit(true);
      
      // Show error but don't block the form
      setErrorMessage("Using local data. Server error: " + getedit_message);
      
      // Try to get user data from localStorage as fallback
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const localData = JSON.parse(raw);
          console.log("Using localStorage data as fallback:", {
            hasFirstname: !!localData.firstname,
            hasLastname: !!localData.lastname,
            hasCountry: !!(localData.country || localData.State)
          });
          
          // Set form values from localStorage
          if (localData.firstname) {
            setFirstnamepl(localData.firstname);
            setFirstname(localData.firstname);
          }
          
          if (localData.lastname) {
            setLastnamepl(localData.lastname);
            setLastname(localData.lastname);
          }
          
          if (localData.country || localData.State) {
            const locationValue = localData.country || localData.State;
            setCountrypl(locationValue);
            setCountry(locationValue);
          }
          
          // Profile picture may not be in localStorage
          if (localData.photolink) {
            setProfileimg(localData.photolink);
          }
          
          // Bio may not be in localStorage
          if (localData.bio) {
            setBiopl(localData.bio);
            setBio(localData.bio);
          }
          
          // Username may not be in localStorage
          if (localData.username) {
            // Remove @ prefix if it exists when loading from localStorage
            const cleanUsername = localData.username.startsWith('@') 
              ? localData.username.substring(1) 
              : localData.username;
            setUsernamepl(cleanUsername);
            setUsername(cleanUsername);
          }
        }
      } catch (e) {
        console.error("Error reading from localStorage:", e);
      }
    }
  }, [getedit_stats, data, getedit_message, dispatch]);

  // Handle API response for profile update
  useEffect(() => {
    // Handle successful profile update
    if (updateEdit_stats === "succeeded") {
      setTimeout(() => {
        dispatch(comprofilechangeStatus("idle") as unknown as AnyAction);
      }, 300);
      
      setLoading(false);
      setSuccessMessage("Profile updated successfully!");

      // Redirect back to profile page after a short delay
      setTimeout(() => {
        // Use uppercase 'P' in Profile to match the directory structure
        router.push(`/Profile/${routeUserId}`);
        // Refresh posts to show updated user info
        dispatch(getallpost({ 
          userid: routeUserId,
          hasToken: true 
        }) as unknown as AnyAction);
        
        // Force a page refresh to show updated profile image
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 2000);
    }

    // Handle failed profile update
    if (updateEdit_stats === "failed") {
      setTimeout(() => {
        dispatch(comprofilechangeStatus("idle") as unknown as AnyAction);
      }, 300);
      
      setLoading(false);
      setShowEdit(true);
      
      // Provide better error messages based on the error type
      let errorMessage = "Failed to update profile: " + updateEdit_message;
      
      if (updateEdit_message.includes("session has expired") || updateEdit_message.includes("token Expire")) {
        errorMessage = "Your session has expired. Please log in again to update your profile.";
        // Optionally redirect to login after a delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else if (updateEdit_message.includes("permission")) {
        errorMessage = "You don't have permission to update this profile.";
      } else if (updateEdit_message.includes("Invalid profile data")) {
        errorMessage = "Please check your information and try again.";
      }
      
      setErrorMessage(errorMessage);
      console.log("Profile update failed:", updateEdit_message);
    }
  }, [updateEdit_stats, updateEdit_message, routeUserId, router, dispatch]);

  // Handle form submission
  const updateButton = async () => {
    
      // Only validate username if user has entered one
      // if (username && username.length >= 3) {
      //   // Check username format first
      //   const usernameRegex = /^[a-z0-9_]{3,15}$/;
      //   if (!usernameRegex.test(username)) {
      //     setErrorMessage("Username must be 3-15 characters, lowercase letters, numbers, and underscores only");
      //     return;
      //   }

      //   // Check if username validation is still in progress
      //   if (isCheckingUsername) {
      //     setErrorMessage("Please wait for username validation to complete");
      //     return;
      //   }

      //   // Check if username is invalid
      //   if (usernameStatus === "invalid") {
      //     setErrorMessage("Please choose a different username");
      //     return;
      //   }

      //   // Check if username validation hasn't been completed yet
      //   if (usernameStatus === "") {
      //     setErrorMessage("Please wait for username validation to complete");
      //     return;
      //   }
      // }

      setLoading(true);
      setShowEdit(false);
      setErrorMessage("");

      // Get tokens from the helper functions defined at component level
      const localData = getLocalStorageData();
      const cookieToken = getCookieToken();
      
      // Try all possible token sources
      const effectiveToken = token || localData.token || cookieToken;

      // Create a more complete authentication payload
      const changedProfileData = {
        userid: routeUserId, // Use the route user ID
        token: effectiveToken,
        hasToken: true, // Ensure this flag is set
        accesstoken: localData.rawData?.accesstoken || "",
        refreshtoken: localData.rawData?.refreshtoken || "",
        userID: localData.userID || loggedInUserId || routeUserId,
        
        // Profile data - only include fields that have been changed
        ...(deletePhotolink && { deletePhotolink }),
        ...(deletePhotoID && { deletePhotoID }),
        ...(updatePhoto && { updatePhoto }),
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
        ...(country && { state: country, country }),
        ...(bio && { bio }),
        ...(username && { username: `@${username}` }), // Add @ prefix when saving
      };

      // Log the profile update payload (without actual token values)
      console.log("🔍 [EditProfile] Form values being sent:", {
        bioValue: bio,
        bioPlaceholder: biopl,
        usernameValue: username,
        usernamePlaceholder: usernamepl,
        bioFinal: bio || biopl,
        usernameFinal: username || usernamepl,
        bioIsEmpty: !bio,
        usernameIsEmpty: !username,
        bioLength: bio?.length || 0,
        usernameLength: username?.length || 0
      });
      
      console.log("Sending profile update payload:", {
        userid: changedProfileData.userid,
        userID: changedProfileData.userID,
        hasToken: changedProfileData.hasToken,
        token: changedProfileData.token ? "exists" : "missing",
        accesstoken: changedProfileData.accesstoken ? "exists" : "missing",
        refreshtoken: changedProfileData.refreshtoken ? "exists" : "missing",
        updatePhoto: changedProfileData.updatePhoto ? "exists" : "missing",
        updatePhotoType: changedProfileData.updatePhoto ? typeof changedProfileData.updatePhoto : "none",
        updatePhotoSize: changedProfileData.updatePhoto instanceof File ? changedProfileData.updatePhoto.size : "not a file",
        firstname: changedProfileData.firstname,
        lastname: changedProfileData.lastname,
        bio: changedProfileData.bio,
        username: changedProfileData.username,
        state: changedProfileData.state
      });
      
      // Make sure we're sending the actual token values in the request
      const finalProfileData = {
        ...changedProfileData,
        // Make sure the token is actually sent, not just a flag
        token: changedProfileData.token,
        accesstoken: changedProfileData.accesstoken,
        refreshtoken: changedProfileData.refreshtoken
      };

      // Send update request
      dispatch(updateEdit(finalProfileData) as unknown as AnyAction);
   
  };

  return (
    <div className="w-screen sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-11/12 mx-auto md:mr-auto md:ml-0">
      <div className="chat_nav ">
        <Gennavigation click={click} setclick={setclick}  />
      </div>
      <HeaderBackNav title=""  />

      <div className="md:w-3/5 md:mx-auto">
        <div className="w-full h-full flex flex-col items-center md:w-3/4 mt-4 sm:mt-3 md:mr-auto md:ml-0">
          <p className="text-slate-400 font-bold border border-b-2 border-t-0 border-r-0 border-l-0 border-slate-400">
            Edit your Profile Information
          </p>

          {!isAuthorized && errorMessage && (
            <div className="flex flex-col items-center mt-8 w-full">
              <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-400 px-4 py-3 rounded-lg">
                <p>{errorMessage}</p>
              </div>
              <button 
                className="mt-4 bg-gray-700 hover:bg-gray-600 text-white text-sm py-2 px-4 rounded-md"
                onClick={() => router.push(`/Profile/${routeUserId}`)}
              >
                Back to Profile
              </button>
            </div>
          )}
          
          {loading && isAuthorized && (
            <div className="flex flex-col items-center mt-16 w-full" id="edit-profile-loader" data-loading="true">
              <PacmanLoader
                color={color}
                loading={loading}
                size={30}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
              <p className="text-white text-xs mt-2">Loading profile data...</p>
             
            </div>
          )}
          
          {successMessage && (
            <div className="flex flex-col items-center mt-8 w-full">
              <div className="bg-green-600 bg-opacity-20 border border-green-500 text-green-400 px-4 py-3 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>{successMessage}</span>
              </div>
              <p className="text-gray-400 text-sm mt-2">Redirecting to your profile...</p>
            </div>
          )}
          
          {errorMessage && isAuthorized && showEdit && (
            <div className="w-full max-w-md mx-auto mt-4 mb-2">
              <div className="bg-red-600 bg-opacity-20 border border-red-500 text-red-400 px-4 py-2 rounded-lg text-sm">
                {errorMessage}
              </div>
            </div>
          )}

          {showEdit && (
            <div className="w-full mb-28">
              <div className="w-full flex flex-col items-center mt-4 ">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-r from-blue-500 to-purple-600">
                    <div className="w-full h-full rounded-full overflow-hidden bg-black">
                      {(() => {
                        const profileImage = profileimg;
                        const userName = `${firstname || ""} ${lastname || ""}`.trim();
                        const initials = userName.split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2) || "?";
                        
                        if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined" && profileImage !== profileIcon.src) {
                          return (
                            <Image
                              alt="Profile Picture"
                              src={profileImage}
                              width={112}
                              height={112}
                              className="w-full h-full object-cover"
                              onError={() => setProfileimg(profileIcon.src)}
                            />
                          );
                        }
                        
                        return (
                          <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-gray-600">
                            {initials}
                          </div>
                        );
                      })()}
                    </div>
                </div>

                  {/* Overlay with camera icon */}
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => ref.current?.click()}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>

                {/* Delete Profile Picture Button */}
                {profileimg && profileimg !== profileIcon.src && (
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
                        setErrorMessage("");
                        
                        // Get user data for the API call
                        const localData = getLocalStorageData();
                        const effectiveUserId = loggedInUserId || localData.userID || routeUserId;
                        
                        // Immediately update UI
                        setProfileimg(profileIcon.src);
                        setUpdatePhoto(undefined);
                        setDeletePhotolink(profileimg);
                        
                        // Call API to delete profile picture immediately
                        const deleteResponse = await axios.post(`${API_URL}/editprofile`, {
                          userid: effectiveUserId,
                          deletePhotolink: profileimg,
                          deletePhotoID: deletePhotoID
                        });
                        
                        if (deleteResponse.data.ok) {
                          console.log("Profile picture deleted from database successfully");
                          setSuccessMessage("Profile picture deleted successfully!");
                          
                          // Clear the delete fields since deletion is complete
                          setDeletePhotolink(undefined);
                          setDeletePhotoID(undefined);
                        } else {
                          throw new Error(deleteResponse.data.message || "Failed to delete profile picture");
                        }
                      } catch (error) {
                        console.error("Error deleting profile picture:", error);
                        setErrorMessage("Failed to delete profile picture. Please try again.");
                        
                        // Revert UI changes if deletion failed
                        setProfileimg(profileimg);
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white text-xs py-1 px-3 rounded-full transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Deleting..." : "Delete Profile Picture"}
                  </button>
                )}

                {/* Text instruction */}
                <p className="text-sm text-gray-400 mt-2 mb-3">Click on the image to change your profile picture</p>

                {/* Hidden File Input */}
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  ref={ref}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.target.files?.[0]) {
                      // Check file size (limit to 5MB)
                      if (e.target.files[0].size > 5 * 1024 * 1024) {
                        setErrorMessage("File size must be less than 5MB");
                        return;
                      }
                      
                      setProfileimg(URL.createObjectURL(e.target.files[0]));
                      setUpdatePhoto(e.target.files[0]);
                      setErrorMessage(""); // Clear any previous errors
                    }
                  }}
                />
              </div>

              {/* Form */}
              <div className="w-full max-w-md mx-auto mt-6 p-4 bg-gray-900 rounded-xl shadow-md text-slate-700 font-semibold">
                {/* First Name */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">First Name</label>
                  <input
                    type="text"
                    className="rounded-lg bg-slate-600 text-slate-100 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={firstnamepl}
                    value={firstname}
                    onChange={(e) => {
                                const cleanValue = e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, '');
                                setFirstname(cleanValue);
                            }}
                    maxLength={9}
                  />
                  <div className="text-xs text-right mt-1 text-slate-400">
                    {firstname.length}/9 characters
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">Last Name</label>
                  <input
                    type="text"
                    className="rounded-lg bg-slate-600 text-slate-100 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={lastnamepl}
                    value={lastname}
                     onChange={(e) => {
                                const cleanValue = e.currentTarget.value.replace(/[^a-zA-Z0-9_]/g, '');
                                setLastname(cleanValue);
                            }}
                    maxLength={9}
                  />
                  <div className="text-xs text-right mt-1 text-slate-400">
                    {lastname.length}/9 characters
                  </div>
                </div>

                {/* Username */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">Username</label>
                  <div className="relative">
                    {/* <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">@</span> */}
                    <input
                      type="text"
                      className={`rounded-lg bg-slate-600 text-slate-100 p-2 pl-8 pr-10 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm w-full transition-colors ${
                        usernameStatus === "valid" ? 'border border-green-500' : 
                        usernameStatus === "invalid" ? 'border border-red-500' : 
                        usernameStatus === "checking" ? 'border border-yellow-500' : ''
                      }`}
                      placeholder="username"
                      value={username}
                      onChange={async (e) => {
                        const value = e.target.value;
                        // Remove spaces, periods, convert to lowercase, and remove @ if user types it
                        const cleanValue = value.replace(/\s/g, '').replace(/\./g, '').toLowerCase().replace('@', '');
                        setUsername(cleanValue);
                        
                        // Reset status when user starts typing
                        setUsernameStatus("");
                        setUsernameValid(false);
                        setUsernameError("");
                        
                        // Check uniqueness after a short delay
                        if (cleanValue.length >= 3) {
                          setTimeout(() => {
                            checkUsernameUniqueness(cleanValue);
                          }, 500);
                        }
                      }}
                      maxLength={15}
                    />
                    {/* Status indicator */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCheckingUsername && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                      )}
                      {usernameStatus === "valid" && !isCheckingUsername && (
                        <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {usernameStatus === "invalid" && !isCheckingUsername && (
                        <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-right mt-1 text-slate-400">
                    @{username.length}/15 characters
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    • Must be between 3-15 characters • No periods (.) allowed • Only letters, numbers, and underscores • Must be unique
                  </div>
                  {usernameError && (
                    <div className="text-xs text-red-400 mt-1">
                      {usernameError}
                    </div>
                  )}
                  {usernameStatus === "valid" && (
                    <div className="text-xs text-green-400 mt-1">
                      ✓ Username is available
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div className="flex flex-col mb-4">
                  <label className="mb-1 text-sm text-slate-300">Bio</label>
                  <textarea
                    className="rounded-lg bg-slate-600 text-slate-100 p-2 h-32 resize-none placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    placeholder={biopl || "Write something about yourself..."}
                    value={bio}
                    onChange={(e) => setBio(e.currentTarget.value)}
                    maxLength={100}
                  ></textarea>
                  <div className="text-xs text-right mt-1 text-slate-400">
                    {bio.length}/100 characters
                  </div>
                </div>

                {/* Country Dropdown */}
                <div className="flex flex-col mb-6">
                  <label className="mb-1 text-sm text-slate-300">Country</label>
                  <select
                    className="rounded-lg bg-slate-600 text-slate-100 p-2 placeholder:text-slate-500 placeholder:font-normal placeholder:text-sm"
                    value={country || countrypl}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {countryList.map((countryName, index) => (
                      <option key={index} value={countryName}>
                        {countryName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                <button
                    className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-colors text-white font-medium py-3 px-4 rounded-lg w-full text-center disabled:opacity-50 `}
                  onClick={updateButton}
                >
                    save changes
                  </button>
                  
                  <button
                    className="bg-transparent border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors font-medium py-2 px-4 rounded-lg w-full text-center disabled:opacity-50"
                    onClick={() => router.push(`/Profile/${routeUserId}`)}
                    disabled={loading}
                  >
                    Cancel
                </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
