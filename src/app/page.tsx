import PostsCard from "@/components/home/post";
import AdminNotificationModal from "@/components/AdminNotificationModal";
import React from "react";

const HomePage = () => {
  
  return (
    <div className="w-full mx-auto space-y-5 px-2 md:mt-0 mt-8">
      <AdminNotificationModal />
      <PostsCard />
    </div>
  );
};

export default HomePage;
