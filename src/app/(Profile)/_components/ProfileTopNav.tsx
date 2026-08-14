"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axios from "axios";

import { URL as API_URL } from "@/api/config";
import optionicon from "@/icons/editcommenticon.svg";
import editIcon from "@/icons/edit.svg";

type Props = {
  name: string;
  handle: string;
  isOwnProfile: boolean;
  profileSlugForUrl: string;
  viewingUserId: string;
  loggedInUserId: string;
};

const ProfileTopNav = ({
  name,
  handle,
  isOwnProfile,
  profileSlugForUrl,
  viewingUserId,
  loggedInUserId,
}: Props) => {
  const router = useRouter();
  const [closeOption, setcloseOption] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const navigate = (path: string) => router.push(path);

  const handleShare = async () => {
    const url = `${window.location.origin}/${profileSlugForUrl}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name || "Profile"} on mmeko`, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
      }
    } catch {
      // user cancelled share — do nothing
    }
  };

  const handleBlockUser = async () => {
    if (!loggedInUserId || !viewingUserId) {
      toast.error("Unable to block user. Please log in and try again.");
      return;
    }
    if (blocking) return;
    setBlocking(true);

    try {
      const token = (() => {
        try {
          const raw = localStorage.getItem("login");
          if (raw) {
            const data = JSON.parse(raw);
            return data?.accesstoken || data?.refreshtoken;
          }
        } catch {
          // silent
        }
        return "";
      })();

      if (!token) {
        toast.error("Please log in to block users");
        return;
      }

      const response = await axios.post(
        `${API_URL}/block/block`,
        {
          blockerId: loggedInUserId,
          blockedUserId: viewingUserId,
          reason: "Blocked from profile",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.ok) {
        toast.success("User blocked successfully");
        navigate("/");
      } else {
        toast.error(response.data.message || "Failed to block user");
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to block user. Please try again.";
      toast.error(message);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <>
      <style jsx>{`
      .ptn-nav{
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          z-index: 50;
          overflow: visible;
          background: rgba(8, 11, 20, 0.92);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          padding: 0 16px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .ptn-spacer {
          height: 54px;
          width: 100%;
        }
        
        .ptn-back {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 22px;
          cursor: pointer;
          padding: 4px 8px;
          border-radius: 8px;
          transition: color 0.2s;
          line-height: 1;
        }
        .ptn-back:hover {
          color: #f1f5f9;
        }
        .ptn-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .ptn-logo-icon {
          width: 28px;
          height: 28px;
          border-radius: 7px;
          background: linear-gradient(135deg, #6c63ff, #9b59f5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 800;
          color: white;
        }
        .ptn-logo-name {
          font-size: 15px;
          font-weight: 700;
          color: #f1f5f9;
        }
        .ptn-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
          margin-left: auto;
        }
        @media (max-width: 768px) {
          .ptn-actions {
            transform: translateX(15px);
          }
        }
        .ptn-share {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 600;
          padding: 7px 14px;
          border-radius: 8px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }
        .ptn-share:hover {
          color: #f1f5f9;
        }
      `}</style>

      <nav className="ptn-nav">
        <button className="ptn-back" onClick={() => router.back()}>
          ←
        </button>

        <a href="#" className="ptn-logo">
          <div className="ptn-logo-icon">M</div>
          <span className="ptn-logo-name">mmeko</span>
        </a>

        <div className="ptn-actions">
          <button className="ptn-share" onClick={handleShare}>
            Share
          </button>

          <div style={{ position: "relative" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setcloseOption((prev) => !prev);
              }}
              style={{
                padding: "8px",
                background: "#161b2e",
                borderRadius: "50%",
                border: "none",
                cursor: "pointer",
              }}
            >
              <Image className="w-5 h-5" alt="options" src={optionicon} />
            </button>

            {closeOption && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                  onClick={() => setcloseOption(false)}
                />
                <div
                  style={{
                    position: "fixed",
                    right: 16,
                    top: 60,
                    background: "#161b2e",
                    borderRadius: 8,
                    boxShadow: "0 8px 24px rgba(0,0,0,.4)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    zIndex: 99999,
                    minWidth: 160,
                  }}
                >
                  {isOwnProfile ? (
                    <button
                      onClick={() => {
                        navigate(`/${profileSlugForUrl}/editprofile`);
                        setcloseOption(false);
                      }}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        color: "#f1f5f9",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                      }}
                    >
                      <Image src={editIcon} alt="edit" className="w-4 h-4" /> Edit Profile
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          navigate(`/${profileSlugForUrl}/about`);
                          setcloseOption(false);
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          textAlign: "left",
                          color: "#f1f5f9",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 13,
                        }}
                      >
                        About this Page
                      </button>
                      <button
                        disabled={blocking}
                        onClick={() => {
                          setcloseOption(false);
                          handleBlockUser();
                        }}
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          textAlign: "left",
                          color: "#f472b6",
                          background: "none",
                          border: "none",
                          cursor: blocking ? "not-allowed" : "pointer",
                          opacity: blocking ? 0.6 : 1,
                          fontSize: 13,
                        }}
                      >
                        {blocking ? "Blocking..." : "Block User"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
      <div className="ptn-spacer" />
    </>
  );
};

export default ProfileTopNav;