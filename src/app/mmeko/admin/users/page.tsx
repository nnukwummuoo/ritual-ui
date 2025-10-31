"use client";

import React, { useState, useEffect, JSX } from "react";
import searchIcon from "@/icons/searchicon.svg";
import sendIcon from "@/icons/emailsendIcon.svg";
import PacmanLoader from "react-spinners/RingLoader";
import { ToastContainer, toast } from "material-react-toastify";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { getalluser } from "@/store/admin";
import { loginAuthUser } from "@/store/registerSlice";
import { getprofile } from "@/store/profile";
import { URL } from "@/api/config";
import { getImageSource } from "@/lib/imageUtils";
import { checkUserBanStatus } from "@/utils/banCheck";

interface User {
  _id: string;
  firstname: string;
  lastname: string;
  gender: string;
  country: string;
  photolink: string;
  username?: string;
  bio?: string;
  age?: string;
  dob?: string;
  balance?: string;
  withdrawbalance?: string;
  coinBalance?: number;
  pending?: number;
  earnings?: number;
  active?: boolean;
  admin?: boolean;
  creator_verified?: boolean;
  creator_portfolio?: boolean;
  Creator_Application_status?: string;
  creator_portfolio_id?: string;
  followers?: string[];
  following?: string[];
  isVip?: boolean;
  vipStartDate?: string;
  vipEndDate?: string;
  vipAutoRenewal?: boolean;
  banned?: boolean;
  banReason?: string;
  bannedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


interface FollowerUser {
  id: string;
  name: string;
  image: string;
  email: string;
  gender: string;
  country: string;
  creator_verified: boolean;
  balance: string;
  earnings: number;
  isVip: boolean;
  createdAt: string;
}

interface FollowData {
  followers: FollowerUser[];
  following: FollowerUser[];
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (userId: string, updates: Partial<User>) => Promise<void>;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ user, isOpen, onClose, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [loading, setLoading] = useState(false);
  const [followData, setFollowData] = useState<FollowData>({ followers: [], following: [] });
  const [loadingFollows, setLoadingFollows] = useState(false);
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
      fetchUserFollows(user._id);
    }
  }, [user]);

  const fetchUserFollows = async (userId: string) => {
    setLoadingFollows(true);
    try {
      const response = await fetch(`${URL}/getUserFollowers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userid: userId })
      });

      if (response.ok) {
        const data = await response.json();
        setFollowData(data.data);
      } else {
        console.error('Failed to fetch user follows');
      }
    } catch (error) {
      console.error('Error fetching user follows:', error);
    } finally {
      setLoadingFollows(false);
    }
  };

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdateUser(user._id, editedUser);
      setIsEditing(false);
      toast.success("User updated successfully");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditedUser({ ...user });
    setIsEditing(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-yellow-500">
              {user.firstname} {user.lastname}
            </h2>
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">Basic Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-sm">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.firstname || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, firstname: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white">{user.firstname}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.lastname || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, lastname: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white">{user.lastname}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Gender</label>
                  {isEditing ? (
                    <select
                      value={editedUser.gender || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, gender: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  ) : (
                    <p className="text-white capitalize">{user.gender}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Country</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.country || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, country: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white">{user.country}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Age</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.age || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, age: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white">{user.age || "N/A"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">Financial Information</h3>
              <div className="space-y-3">
                {/* Account Balance - Always shown */}
                <div>
                  <label className="text-gray-300 text-sm">Account Balance</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.balance || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, balance: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white  text-lg">{user.balance || "0"} </p>
                  )}
                </div>

                {/* Pending Amount - Always shown for both creator and normal users */}
                <div>
                  <label className="text-gray-300 text-sm">Pending Amount</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editedUser.pending || 0}
                      onChange={(e) => setEditedUser({ ...editedUser, pending: Number(e.target.value) })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white text-lg">{user.pending || 0}</p>
                  )}
                </div>

                {/* Only show earnings and withdrawal logic if user is creator verified */}
                {user.creator_verified ? (
                  <>
                    <div>
                      <label className="text-gray-300 text-sm">Earnings</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedUser.earnings || 0}
                          onChange={(e) => setEditedUser({ ...editedUser, earnings: Number(e.target.value) })}
                          className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                        />
                      ) : (
                        <p className="text-white">{user.earnings || 0} gold</p>
                      )}
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">USD Value (1 gold = $0.04)</label>
                      <p className="text-white font-bold text-lg">
                        ${((user.earnings || 0) * 0.04).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">Coin Balance</label>
                      {isEditing ? (
                        <input
                          type="number"
                          value={editedUser.coinBalance || 0}
                          onChange={(e) => setEditedUser({ ...editedUser, coinBalance: Number(e.target.value) })}
                          className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                        />
                      ) : (
                        <p className="text-white">{user.coinBalance || 0} coins</p>
                      )}
                    </div>
                    
                    {/* Withdrawal Logic - Only based on earnings */}
                    {(() => {
                      const earningsUsd = (user.earnings || 0) * 0.04;
                      const isWithdrawable = earningsUsd >= 50;
                      
                      return (
                        <>
                          <div>
                            <label className="text-gray-300 text-sm">
                              {isWithdrawable ? "Withdrawable Amount" : "Unwithdrawable Amount"}
                            </label>
                            <p className={`font-bold text-lg ${isWithdrawable ? "text-green-400" : "text-red-400"}`}>
                              ${earningsUsd.toFixed(2)} ${!isWithdrawable ? "(< $50 required)" : ""}
                            </p>
                          </div>
                          {!isWithdrawable && (
                            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-3">
                              <p className="text-red-300 text-sm">
                                <strong>Note:</strong> Withdrawal requires earnings of at least $50. 
                                Current earnings: ${earningsUsd.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </>
                ) : (
                  <div className="bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-300 text-sm">
                      <strong>Note:</strong> This user is not creator verified. Only account balance is available.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Account Status */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">Account Status</h3>
              <div className="space-y-3">
                {/* <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">Active:</label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser.active || false}
                      onChange={(e) => setEditedUser({ ...editedUser, active: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs ${user.active ? "bg-green-500" : "bg-red-500"}`}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  )}
                </div> */}
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">Admin:</label>
                  <span className={`px-2 py-1 rounded text-xs ${user.admin ? "bg-purple-500" : "bg-gray-500"}`}>
                    {user.admin ? "Admin" : "User"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">Creator Verified:</label>
                  {isEditing ? (
                    <input
                      type="checkbox"
                      checked={editedUser.creator_verified || false}
                      onChange={(e) => setEditedUser({ ...editedUser, creator_verified: e.target.checked })}
                      className="w-4 h-4"
                    />
                  ) : (
                    <span className={`px-2 py-1 rounded text-xs ${user.creator_verified ? "bg-green-500" : "bg-gray-500"}`}>
                      {user.creator_verified ? "Verified" : "Not Verified"}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-gray-300 text-sm">VIP Status:</label>
                  <span className={`px-2 py-1 rounded text-xs ${user.isVip ? "bg-yellow-500" : "bg-gray-500"}`}>
                    {user.isVip ? "VIP" : "Regular"}
                  </span>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Creator Application Status</label>
                  <p className="text-white capitalize">{user.Creator_Application_status || "None"}</p>
                </div>
              </div>
            </div>

            {/* Social Information */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">Social Information</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-sm">Followers</label>
                  <p className="text-white">{followData.followers.length}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Following</label>
                  <p className="text-white">{followData.following.length}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedUser.username || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, username: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1"
                    />
                  ) : (
                    <p className="text-white">{user.username || "N/A"}</p>
                  )}
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Bio</label>
                  {isEditing ? (
                    <textarea
                      value={editedUser.bio || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                      className="w-full bg-gray-700 text-white p-2 rounded mt-1 h-20"
                    />
                  ) : (
                    <p className="text-white">{user.bio || "No bio available"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Dates */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-yellow-500 mb-4">Account Dates</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-gray-300 text-sm">Created At</label>
                  <p className="text-white">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Last Updated</label>
                  <p className="text-white">{formatDate(user.updatedAt)}</p>
                </div>
                <div>
                  <label className="text-gray-300 text-sm">Date of Birth</label>
                  <p className="text-white">{user.dob || "N/A"}</p>
                </div>
                {user.isVip && (
                  <>
                    <div>
                      <label className="text-gray-300 text-sm">VIP Start Date</label>
                      <p className="text-white">{formatDate(user.vipStartDate)}</p>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">VIP End Date</label>
                      <p className="text-white">{formatDate(user.vipEndDate)}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

             {/* Profile Photo */}
             <div className="bg-gray-800 p-4 rounded-lg">
               <h3 className="text-lg font-semibold text-yellow-500 mb-4">Profile Photo</h3>
               <div className="flex justify-center">
                 {(() => {
                   const profileImage = user.photolink;
                   const imageSource = getImageSource(profileImage || "", 'profile');
                   const initials = `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
                   
                   if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                     return (
                       <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                         <img
                           src={imageSource.src}
                           alt="Profile"
                           className="w-full h-full object-cover"
                           onError={(e) => {
                             const target = e.currentTarget as HTMLImageElement;
                             target.style.display = 'none';
                             const nextElement = target.nextElementSibling as HTMLElement;
                             if (nextElement) nextElement.style.display = 'flex';
                           }}
                         />
                         <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-2xl font-bold" style={{ display: 'none' }}>
                           {initials || '?'}
                         </div>
                       </div>
                     );
                   }
                   
                   return (
                     <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center">
                       <span className="text-gray-400 text-lg">{initials || 'No Photo'}</span>
                     </div>
                   );
                 })()}
               </div>
             </div>

             {/* Followers and Following */}
             <div className="bg-gray-800 p-4 rounded-lg md:col-span-2">
               <h3 className="text-lg font-semibold text-yellow-500 mb-4">Followers & Following</h3>
               
               {/* Tab Navigation */}
               <div className="flex gap-2 mb-4">
                 <button
                   onClick={() => setActiveTab('followers')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                     activeTab === 'followers'
                       ? 'bg-yellow-500 text-black'
                       : 'bg-gray-700 text-white hover:bg-gray-600'
                   }`}
                 >
                   Followers ({followData.followers.length})
                 </button>
                 <button
                   onClick={() => setActiveTab('following')}
                   className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                     activeTab === 'following'
                       ? 'bg-yellow-500 text-black'
                       : 'bg-gray-700 text-white hover:bg-gray-600'
                   }`}
                 >
                   Following ({followData.following.length})
                 </button>
               </div>

               {/* Content */}
               <div className="max-h-64 overflow-y-auto">
                 {loadingFollows ? (
                   <div className="flex justify-center items-center py-8">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                     <span className="ml-2 text-white">Loading...</span>
                   </div>
                 ) : (
                   <div className="space-y-3">
                     {(activeTab === 'followers' ? followData.followers : followData.following).map((follower) => (
                       <div key={follower.id} className="flex items-center p-3 bg-gray-700 rounded-lg">
                         <div className="flex items-center space-x-3">
                           <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                             {follower.image && follower.image.trim() && follower.image !== "null" && follower.image !== "undefined" ? (
                               <img
                                 src={getImageSource(follower.image, 'profile').src}
                                 alt="Profile"
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                   const target = e.currentTarget as HTMLImageElement;
                                   target.style.display = 'none';
                                   const nextElement = target.nextElementSibling as HTMLElement;
                                   if (nextElement) nextElement.style.display = 'flex';
                                 }}
                               />
                             ) : null}
                             <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-sm font-bold" style={{ display: follower.image && follower.image.trim() && follower.image !== "null" && follower.image !== "undefined" ? 'none' : 'flex' }}>
                               {follower.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?'}
                             </div>
                           </div>
                           <div>
                             <p className="text-white font-medium">{follower.name}</p>
                             <p className="text-gray-400 text-sm">{follower.email}</p>
                             <div className="flex gap-2 mt-1">
                               <span className={`px-2 py-1 rounded text-xs ${follower.creator_verified ? 'bg-blue-500' : 'bg-gray-500'}`}>
                                 {follower.creator_verified ? 'Creator' : 'Fan'}
                               </span>
                               {follower.isVip && (
                                 <span className="px-2 py-1 rounded text-xs bg-yellow-500">VIP</span>
                               )}
                               <span className="px-2 py-1 rounded text-xs bg-gray-600">
                                 {follower.gender}
                               </span>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                     
                     {(activeTab === 'followers' ? followData.followers : followData.following).length === 0 && (
                       <div className="text-center py-8">
                         <p className="text-gray-400">
                           No {activeTab} found
                         </p>
                       </div>
                     )}
                   </div>
                 )}
               </div>
             </div>

           </div>
        </div>
      </div>
    </div>
  );
};

export default function Users(): JSX.Element {
  const [male_click, setmale_click] = useState(false);
  const [female_click, setfemale_click] = useState(false);
  const [showall_click, setshowall_click] = useState(false);
  const [alluser_list, setalluser_list] = useState<User[]>([]);
  const [user_list, setuser_list] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationGender, setNotificationGender] = useState<"all" | "creators" | "male" | "female">("all");
  const [hasLearnMore, setHasLearnMore] = useState(false);
  const [learnMoreUrl, setLearnMoreUrl] = useState("");
  const [sendingNotification, setSendingNotification] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [paginatedUsers, setPaginatedUsers] = useState<User[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [color] = useState("#d49115");
  const [display, setdisplay] = useState(false);
  const [search_text, set_search_text] = useState("");

  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const userid = useSelector((s: RootState) => s.register.userID);
  const profileStatus = useSelector((s: RootState) => s.profile.status);
  const usersFromStore = useSelector((s: RootState) => s.admin.alluser_list) as User[];
  const usersStatus = useSelector((s: RootState) => s.admin.alluser_stats);

  useEffect(() => {
    // Ensure profile is loaded before enforcing admin gate
    if (token && userid && profileStatus === "idle") {
      dispatch(getprofile({ userid, token }));
    }

    // Hydrate from localStorage if token/ids are missing
    if ((!token || !userid) && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("login");
        if (raw) {
          const saved = JSON.parse(raw);
          dispatch(
            loginAuthUser({
              email: saved.email,
              password: saved.password,
              message: "restored",
              refreshtoken: saved.refreshtoken,
              accesstoken: saved.accesstoken,
              userID: saved.userID,
              creator_portfolio_id: saved.creator_portfolio_id,
              creator_portfolio: saved.creator_portfolio,
            })
          );
        }
      } catch {}
    }

    if (usersStatus === "idle") {
      dispatch(getalluser({}));
    }
  }, [dispatch, token, userid, usersStatus, profileStatus]);

  useEffect(() => {
    // sync local lists with store list
    setuser_list(usersFromStore || []);
    setalluser_list(usersFromStore || []);
    setdisplay(true);
    setLoading(usersStatus === "loading");
  }, [usersFromStore, usersStatus]);

  // Handle pagination when alluser_list changes
  useEffect(() => {
    const totalPages = Math.ceil(alluser_list.length / usersPerPage);
    setTotalPages(totalPages);
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginated = alluser_list.slice(startIndex, endIndex);
    setPaginatedUsers(paginated);
  }, [alluser_list, currentPage, usersPerPage]);

  const diplay_users = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <PacmanLoader
            color={color}
            loading={loading}
            size={30}
            aria-label="Loading Spinner"
            data-testid="loader"
          />
          <p className="text-yellow-500 text-xs mt-4">fetching all users...</p>
        </div>
      );
    }
    
    if (alluser_list.length > 0) {
        return (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 overflow-auto">
              <table className="w-full bg-gray-800 rounded-lg overflow-hidden">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Photo</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Username</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Gender</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Country</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Balance</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Earnings</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Ban Status</th>
                    <th className="px-4 py-3 text-left text-yellow-500 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="px-4 py-3">
                        {(() => {
                          const profileImage = user.photolink;
                          const imageSource = getImageSource(profileImage || "", 'profile');
                          const initials = `${user.firstname?.[0] || ''}${user.lastname?.[0] || ''}`.toUpperCase();
                          
                          if (profileImage && profileImage.trim() && profileImage !== "null" && profileImage !== "undefined") {
                            return (
                              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex items-center justify-center">
                                <img
                                  src={imageSource.src}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.currentTarget as HTMLImageElement;
                                    target.style.display = 'none';
                                    const nextElement = target.nextElementSibling as HTMLElement;
                                    if (nextElement) nextElement.style.display = 'flex';
                                  }}
                                />
                                <div className="absolute inset-0 bg-gray-600 flex items-center justify-center text-white text-sm font-bold" style={{ display: 'none' }}>
                                  {initials || '?'}
                                </div>
                              </div>
                            );
                          }
                          
                          return (
                            <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white text-sm font-bold">
                              {initials || '?'}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {user.firstname} {user.lastname}
                      </td>
                      <td className="px-4 py-3 text-white">
                        {user.username || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-white capitalize">{user.gender}</td>
                      <td className="px-4 py-3 text-white">{user.country}</td>
                      <td className="px-4 py-3 text-white">{user.balance || "0"}</td>
                      <td className="px-4 py-3 text-white">{user.earnings || "0"}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                        {!user.creator_verified && (
                            <span className="px-2 py-1 rounded text-xs bg-green-800">Fan</span>
                          )}
                          {user.isVip && (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-500">VIP</span>
                          )}
                          {user.creator_verified && (
                            <span className="px-2 py-1 rounded text-xs bg-blue-500">Creator</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {user.banned ? (
                            <span className="px-2 py-1 rounded text-xs bg-red-500">Banned</span>
                          ) : (
                            <span className="px-2 py-1 rounded text-xs bg-green-500">Active</span>
                          )}
                          {user.banned && user.banReason && (
                            <span className="px-1 py-0.5 rounded text-xs bg-red-800 text-xs" title={user.banReason}>
                              {user.banReason.length > 20 ? user.banReason.substring(0, 20) + '...' : user.banReason}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                          >
                            View
                          </button>
                          {user.banned ? (
                            <button
                              onClick={() => handleUnbanUser(user._id)}
                              className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                            >
                              Unban
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBanUser(user._id)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                            >
                              Ban
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls - Fixed at bottom */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center mt-4 space-x-2 bg-gray-800 p-4 rounded-lg">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-yellow-500 text-black font-bold'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
            
            {/* Pagination Info */}
            <div className="text-center mt-2 text-gray-400 text-sm">
              Showing {((currentPage - 1) * usersPerPage) + 1} to {Math.min(currentPage * usersPerPage, alluser_list.length)} of {alluser_list.length} users
            </div>
          </div>
        );
      } else {
        return (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-yellow-500 text-lg">No registered users yet!!!</p>
          </div>
        );
      }
    }


  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone and will delete all user data including posts and portfolio if they are a creator.")) {
      try {
        const response = await fetch(`${URL}/deleteuser`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            userid: userId
          })
        });

        if (response.ok) {
          const data = await response.json();
          toast.success(data.message || "User deleted successfully", { autoClose: 2000 });
          
          // Remove user from local state immediately
          setuser_list(prev => prev.filter(user => user._id !== userId));
          setalluser_list(prev => prev.filter(user => user._id !== userId));
          
          // Close modal if the deleted user was selected
          if (selectedUser && selectedUser._id === userId) {
            setIsModalOpen(false);
            setSelectedUser(null);
          }
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to delete user", { autoClose: 2000 });
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error("Failed to delete user", { autoClose: 2000 });
      }
    }
  };


  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`${URL}/edituser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          updates: updates
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "User updated successfully");
        
        // Update user in local state
        setuser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, ...updates } : user
        ));
        setalluser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, ...updates } : user
        ));
        
        // Update the selected user in the modal
        if (selectedUser) {
          setSelectedUser({ ...selectedUser, ...updates });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update user");
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error("Failed to update user");
    }
  };


  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleBanUser = async (userId: string) => {
    const reason = prompt("Enter ban reason (optional):");
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(`${URL}/banuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          reason: reason || "Violation of terms of service"
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "User banned successfully", { autoClose: 2000 });
        
        // Update user in local state
        setuser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, banned: true, banReason: reason || "Violation of terms of service", bannedAt: new Date().toISOString() } : user
        ));
        setalluser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, banned: true, banReason: reason || "Violation of terms of service", bannedAt: new Date().toISOString() } : user
        ));
        
        // Update the selected user in the modal if it's the same user
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, banned: true, banReason: reason || "Violation of terms of service", bannedAt: new Date().toISOString() });
        }
        
        // Check if current user was banned (immediate logout)
        await checkUserBanStatus();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to ban user", { autoClose: 2000 });
      }
    } catch (error) {
      console.error('Error banning user:', error);
      toast.error("Failed to ban user", { autoClose: 2000 });
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to unban this user?")) return;

    try {
      const response = await fetch(`${URL}/unbanuser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || "User unbanned successfully", { autoClose: 2000 });
        
        // Update user in local state
        setuser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, banned: false, banReason: "", bannedAt: undefined } : user
        ));
        setalluser_list(prev => prev.map(user => 
          user._id === userId ? { ...user, banned: false, banReason: "", bannedAt: undefined } : user
        ));
        
        // Update the selected user in the modal if it's the same user
        if (selectedUser && selectedUser._id === userId) {
          setSelectedUser({ ...selectedUser, banned: false, banReason: "", bannedAt: undefined });
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to unban user", { autoClose: 2000 });
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast.error("Failed to unban user", { autoClose: 2000 });
    }
  };


  const handleSendNotification = async () => {
    if (!notificationTitle.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!notificationMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }
    // Learn More URL is optional - if hasLearnMore is true, it can be empty

    setSendingNotification(true);
    try {
      const response = await fetch(`${URL}/adminNotificationSystem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          targetGender: notificationGender,
          notificationType: 'admin_broadcast',
          hasLearnMore: hasLearnMore,
          learnMoreUrl: hasLearnMore ? learnMoreUrl : null
        })
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Notification sent to ${data.details?.totalTargets || 0} users`);
        setShowNotificationModal(false);
        setNotificationTitle("");
        setNotificationMessage("");
        setNotificationGender("all");
        setHasLearnMore(false);
        setLearnMoreUrl("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to send notification");
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error("Failed to send notification");
    } finally {
      setSendingNotification(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ToastContainer position="top-center" theme="dark" />

      {!loading && display && (
        <div className="w-full h-full flex flex-col">
          <div className="w-full flex flex-col gap-3 p-4 mb-4">
              {/* Search */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <label className="text-white mr-2 text-sm font-bold">
                  Search by Name
                </label>
                <input
                  type="text"
                  className="rounded-lg bg-slate-400 placeholder:text-slate-600 placeholder:text-xs mr-1 pl-2 placeholder:text-center h-10 w-full md:w-[28rem] lg:w-[34rem]"
                  placeholder="search by name"
                  onInput={(e) => {
                    const val = e.currentTarget.value;
                    if (val) {
                      set_search_text(val);
                      const filtered = user_list.filter((value) => {
                        const name = `${value.firstname} ${value.lastname}`;
                        const name1 = `${value.lastname} ${value.firstname}`;
                        return (
                          value.firstname.toLowerCase().trim() ===
                            val.toLowerCase().trim() ||
                          value.lastname.toLowerCase().trim() ===
                            val.toLowerCase().trim() ||
                          val === name ||
                          val === name1
                        );
                      });
                      setalluser_list(filtered.length ? filtered : user_list);
                      setCurrentPage(1); // Reset to first page when searching
                    } else {
                      setalluser_list(user_list);
                      setCurrentPage(1); // Reset to first page when clearing search
                    }
                  }}
                />
                <button
                  className="bg-yellow-500 w-fit h-fit rounded-full p-2"
                  onClick={() => {
                    if (search_text) {
                      const filtered = user_list.filter((value) => {
                        const name = `${value.firstname} ${value.lastname}`;
                        const name1 = `${value.lastname} ${value.firstname}`;
                        return (
                          value.firstname.toLowerCase().trim() ===
                            search_text.toLowerCase().trim() ||
                          value.lastname.toLowerCase().trim() ===
                            search_text.toLowerCase().trim() ||
                          search_text === name ||
                          search_text === name1
                        );
                      });
                      setalluser_list(filtered.length ? filtered : user_list);
                      setCurrentPage(1); // Reset to first page when searching
                    }
                  }}
                >
                  <img alt="searchIcon" src={searchIcon.src} />
                </button>
              </div>

              {/* Gender Filter */}
              <div className="flex items-center flex-wrap gap-3 ">
                <label className="text-white mr-2 text-sm font-bold">
                  Filter by Gender:
                </label>
                <div className="flex items-center gap-2">
                  <label className="text-white text-xs mt-1 font-bold">
                    Male
                  </label>
                  <input
                    type="radio"
                    className=" mr-2 mt-1"
                    checked={male_click}
                    name="genderFilter"
                    onChange={(e) => {
                      if (!e.target.checked) return;
                      setfemale_click(false);
                      setmale_click(true);
                      setshowall_click(false);
                      const filtered = user_list.filter(
                        (v) => v.gender.toLowerCase().trim() === "male"
                      );
                      setalluser_list(filtered.length ? filtered : user_list);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                  />
                  <label className="text-white text-xs mt-1 font-bold">
                    Female
                  </label>
                  <input
                    type="radio"
                    className="mt-1"
                    checked={female_click}
                    name="genderFilter"
                    onChange={(e) => {
                      if (!e.target.checked) return;
                      setmale_click(false);
                      setfemale_click(true);
                      setshowall_click(false);
                      const filtered = user_list.filter(
                        (v) => v.gender.toLowerCase().trim() === "female"
                      );
                      setalluser_list(filtered.length ? filtered : user_list);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                  />
                  <label className="text-white text-xs ml-2 mt-1 font-bold">
                    Show all
                  </label>
                  <input
                    type="radio"
                    className="mt-1 "
                    checked={showall_click}
                    name="genderFilter"
                    onChange={(e) => {
                      if (!e.target.checked) return;
                      setmale_click(false);
                      setfemale_click(false);
                      setshowall_click(true);
                      setalluser_list(user_list);
                      setCurrentPage(1); // Reset to first page when showing all
                    }}
                  />
                </div>
              </div>

              {/* Notification Controls */}
              <div className="flex items-center gap-4">
                <button
                  className="text-white flex bg-blue-500 p-2 rounded-full shadow shadow-white hover:bg-blue-400 active:bg-blue-300"
                  onClick={() => setShowNotificationModal(true)}
                >
                  <label className="text-white text-sm font-bold mr-2">
                    Send Notification to All Users
                  </label>
                  <img alt="sendicon" src={sendIcon.src} />
                </button>
                
                
                <div className="text-white text-sm">
                  Total Users: <span className="text-yellow-500 font-bold">{alluser_list.length}</span>
                  {totalPages > 1 && (
                    <span className="ml-2 text-gray-400">
                      (Page {currentPage} of {totalPages})
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Table Container with full height and scrolling */}
            <div className="flex-1 overflow-hidden">
              {diplay_users()}
            </div>
          </div>
        )}

      {/* Show loading state when loading */}
      {loading && (
        <div className="w-full h-full flex flex-col">
          <div className="flex-1 overflow-hidden">
            {diplay_users()}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        onUpdateUser={handleUpdateUser}
      />

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-yellow-500 mb-4">Send Admin Notification</h3>
            
            <div className="mb-4">
              <label className="text-white text-sm font-bold mb-2 block">Target Audience</label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="all"
                    checked={notificationGender === "all"}
                    onChange={(e) => setNotificationGender(e.target.value as "all" | "creators" | "male" | "female")}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">All Users</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="creators"
                    checked={notificationGender === "creators"}
                    onChange={(e) => setNotificationGender(e.target.value as "all" | "creators" | "male" | "female")}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Creators Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={notificationGender === "male"}
                    onChange={(e) => setNotificationGender(e.target.value as "all" | "creators" | "male" | "female")}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Male Only</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={notificationGender === "female"}
                    onChange={(e) => setNotificationGender(e.target.value as "all" | "creators" | "male" | "female")}
                    className="mr-2"
                  />
                  <span className="text-white text-sm">Female Only</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="text-white text-sm font-bold mb-2 block">Title *</label>
              <input
                type="text"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded"
                placeholder="Enter notification title..."
              />
            </div>

            <div className="mb-4">
              <label className="text-white text-sm font-bold mb-2 block">Message *</label>
              <textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                className="w-full bg-gray-700 text-white p-3 rounded h-24 resize-none"
                placeholder="Enter your notification message..."
              />
            </div>

            <div className="mb-4">
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={hasLearnMore}
                  onChange={(e) => setHasLearnMore(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-white text-sm font-bold">Include Learn More Page</span>
              </label>
              {hasLearnMore && (
                <div className="mt-2">
                  <label className="text-white text-sm font-bold mb-2 block">Additional Content (Optional)</label>
                  <textarea
                    value={learnMoreUrl}
                    onChange={(e) => setLearnMoreUrl(e.target.value)}
                    className="w-full bg-gray-700 text-white p-3 rounded h-20 resize-none"
                    placeholder="Enter additional content that will be shown on the Learn More page..."
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    This content will be displayed on the Learn More page. Leave empty to just show the main message.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSendNotification}
                disabled={sendingNotification}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {sendingNotification ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  "Send Notification"
                )}
              </button>
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotificationTitle("");
                  setNotificationMessage("");
                  setNotificationGender("all");
                  setHasLearnMore(false);
                  setLearnMoreUrl("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
