"use client";
import React, { useState } from "react";
import PostMediaLightbox from "./PostMediaLightbox";

export type MediaItem = { url: string; publicId?: string; type: "image" | "video" };

export default function PostMediaCollage({ items }: { items: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const open = (i: number) => setLightboxIndex(i);

  const Tile = ({ item, index, className = "" }: { item: MediaItem; index: number; className?: string }) => (
    <div
      className={`relative overflow-hidden cursor-pointer bg-black ${className}`}
      onClick={() => open(index)}
    >
      {item.type === "video" ? (
        <>
          <video src={item.url} className="w-full h-full object-cover" muted playsInline />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
            </div>
          </div>
        </>
      ) : (
        <img src={item.url} alt="" className="w-full h-full object-cover" />
      )}
    </div>
  );

  return (
    <>
      <div className="w-full">
        {items.length === 1 && (
          <div className="w-full aspect-square">
            <Tile item={items[0]} index={0} className="w-full h-full" />
          </div>
        )}

        {items.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-[2/1]">
            {items.map((item, i) => (
              <Tile key={i} item={item} index={i} className="w-full h-full" />
            ))}
          </div>
        )}

        {items.length === 3 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-square">
            <Tile item={items[0]} index={0} className="row-span-2 w-full h-full" />
            <Tile item={items[1]} index={1} className="w-full h-full" />
            <Tile item={items[2]} index={2} className="w-full h-full" />
          </div>
        )}

        {items.length >= 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-square">
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className="relative w-full h-full">
                <Tile item={item} index={i} className="w-full h-full" />
                {i === 3 && items.length > 4 && (
                  <div
                    className="absolute inset-0 bg-black/60 flex items-center justify-center cursor-pointer"
                    onClick={() => open(3)}
                  >
                    <span className="text-white text-xl font-bold">+{items.length - 4}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {items.length > 1 && (
          <div className="absolute mt-1 ml-1 flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full w-fit">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><rect x="3" y="3" width="14" height="14" rx="2" /><path d="M7 7h14v14H7z" fillOpacity="0.5" /></svg>
            {items.length}
          </div>
        )}
      </div>

      {lightboxIndex !== null && (
        <PostMediaLightbox items={items} startIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </>
  );
}