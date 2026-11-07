"use client";
import React, { useState } from "react";
import { URL as API_BASE } from "@/api/config";
import PostMediaLightbox from "./PostMediaLightbox";

const PROD_BASE = process.env.NEXT_PUBLIC_API || "";

export type MediaItem = { url: string; publicId?: string; type: "image" | "video" };

// Stored link first (fast, direct), then the permanent proxy links built from the
// publicId. Stored signed links expire after <= 7 days; the proxy never does.
const buildSources = (item: MediaItem): string[] => {
  const list: string[] = [];
  if (item.url) list.push(item.url);
  if (item.publicId) {
    const id = encodeURIComponent(item.publicId);
    const path = item.type === "video" ? `api/video/stream/${id}` : `api/image/view?publicId=${id}`;
    list.push(`${API_BASE}/${path}`);
    if (PROD_BASE && PROD_BASE !== API_BASE) list.push(`${PROD_BASE}/${path}`);
  }
  return Array.from(new Set(list));
};

export function SafeMedia({
  item,
  className = "",
  controls = false,
  autoPlay = false,
  muted = false,
}: {
  item: MediaItem;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
}) {
  const sources = buildSources(item);
  const [idx, setIdx] = useState(0);
  const src = sources[Math.min(idx, sources.length - 1)] || "";
  const next = () => setIdx((i) => (i < sources.length - 1 ? i + 1 : i));

  if (!src) return null;

  return item.type === "video" ? (
    <video
      key={src}
      src={src}
      className={className}
      controls={controls}
      autoPlay={autoPlay}
      muted={muted}
      playsInline
      onError={next}
    />
  ) : (
    <img key={src} src={src} alt="" className={className} onError={next} />
  );
}

const Tile = ({
  item,
  index,
  className = "",
  onOpen,
}: {
  item: MediaItem;
  index: number;
  className?: string;
  onOpen: (i: number) => void;
}) => (
  <div className={`relative overflow-hidden cursor-pointer bg-black ${className}`} onClick={() => onOpen(index)}>
    <SafeMedia item={item} className="w-full h-full object-cover" muted />
    {item.type === "video" && (
      <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
        <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z" /></svg>
        </div>
      </div>
    )}
  </div>
);

export default function PostMediaCollage({ items }: { items: MediaItem[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!items || items.length === 0) return null;

  const open = (i: number) => setLightboxIndex(i);

  return (
    <>
      <div className="relative w-full">
        {items.length === 1 && (
          <div className="w-full aspect-[4/5] rounded-xl overflow-hidden">
            <Tile item={items[0]} index={0} className="w-full h-full" onOpen={open} />
          </div>
        )}

        {items.length === 2 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-[2/1]">
            {items.map((item, i) => (
              <Tile key={i} item={item} index={i} className="w-full h-full" onOpen={open} />
            ))}
          </div>
        )}

        {items.length === 3 && (
          <div className="grid grid-cols-2 gap-0.5 aspect-square">
            <Tile item={items[0]} index={0} className="row-span-2 w-full h-full" onOpen={open} />
            <Tile item={items[1]} index={1} className="w-full h-full" onOpen={open} />
            <Tile item={items[2]} index={2} className="w-full h-full" onOpen={open} />
          </div>
        )}

        {items.length >= 4 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 aspect-square">
            {items.slice(0, 4).map((item, i) => (
              <div key={i} className="relative w-full h-full">
                <Tile item={item} index={i} className="w-full h-full" onOpen={open} />
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
          <div className="absolute top-2 right-2 z-10 pointer-events-none flex items-center gap-1 bg-black/60 text-white text-[11px] px-2 py-0.5 rounded-full">
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