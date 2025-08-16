import PostsCard from "@/components/home/post";
import React from "react";

const HomePage = () => {
  return (
    <div className="w-full mx-auto space-y-5 px-2">
      <PostsCard type="image" />
      <PostsCard type="image" />

      <PostsCard type="image" />

      <PostsCard type="image" />
    </div>
  );
};

export default HomePage;
