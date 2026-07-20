"use client";
import React, { useEffect, useRef, useState } from "react";
import type { MediaItem } from "./PostMediaCollage";

export default function PostMediaLightbox({
  items,
  startIndex,
  onClose,
}: {
  items: MediaItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: startIndex * el.clientWidth, behavior: "auto" });
  }, [startIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const newIndex = Math.round(el.scrollLeft / el.clientWidth);
    if (newIndex !== index) setIndex(newIndex);
  };

  const goTo = (i: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-[500] bg-black flex flex-col">
      <div className="flex items-center justify-between p-4 text-white flex-shrink-0">
        <span className="text-sm font-medium">{index + 1} / {items.length}</span>
        <button onClick={onClose} className="text-2xl leading-none">✕</button>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 flex overflow-x-auto snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((item, i) => (
          <div key={i} className="w-full h-full flex-shrink-0 snap-center flex items-center justify-center">
            {item.type === "video" ? (
              <video src={item.url} controls autoPlay={i === index} className="max-w-full max-h-full object-contain" />
            ) : (
              <img src={item.url} alt="" className="max-w-full max-h-full object-contain" />
            )}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 p-4 flex-shrink-0">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all ${i === index ? "bg-white w-4" : "bg-white/40"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}