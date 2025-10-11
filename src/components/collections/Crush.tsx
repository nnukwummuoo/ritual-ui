import React from "react";
import CrushList from "./CrushList";
import type { CrushItem } from "@/types/collection";


const mockCrushData: CrushItem[] = [
  {
    photolink: "https://picsum.photos/150/200?random=10",
    name: "Sophia Martinez",
    id: "crush1",
    userid: "user1",
    hosttype: "premium",
    creator_portfoliio_Id: "creator1",
    location: "Los Angeles",
    online: true,
  },
  {
    photolink: "https://picsum.photos/150/200?random=11",
    name: "Isabella Garcia",
    id: "crush2",
    userid: "user2",
    hosttype: "standard",
    creator_portfoliio_Id: "creator2",
    location: "Miami",
    online: false,
  },
  {
    photolink: "https://picsum.photos/150/200?random=12",
    name: "Olivia Rodriguez",
    id: "crush3",
    userid: "user3",
    hosttype: "premium",
    creator_portfoliio_Id: "creator3",
    location: "New York",
    online: true,
  },
  {
    photolink: "https://picsum.photos/150/200?random=13",
    name: "Emma Thompson",
    id: "crush4",
    userid: "user4",
    hosttype: "standard",
    creator_portfoliio_Id: "creator4",
    location: "Chicago",
    online: true,
  },
];

const Crush: React.FC = () => {
  const listofcrush = mockCrushData; 

  if (!listofcrush.length) {
    return (
      <div className="w-full">
        <p className="mt-16 text-yellow-200 text-xs w-full text-center">
          No crush on your crush list
        </p>
      </div>
    );
  }
  return (
    <div className="w-full flex flex-col">
      <p className="text-slate-50 text-center font-bold mt-2">
        List Of My Crush Creators
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3 p-2">
        {listofcrush.map((item, idx) => (
          <CrushList key={idx} {...item} />
        ))}
      </div>
    </div>
  );
};

export default Crush;