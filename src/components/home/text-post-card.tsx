import Image from "next/image";
import React from "react";

type Props = {
  name: string;
  handle?: string | null;
  content: string;
  avatarUrl?: string | null;
  createdAt?: string | number | Date;
};

export default function TextPostCard({ name, handle, content, avatarUrl, createdAt }: Props) {
  const when = createdAt ? new Date(createdAt) : null;
  const subtitle = [handle ? `@${handle}` : null, when ? when.toLocaleString() : null]
    .filter(Boolean)
    .join(" • ");

  return (
    <div className="mx-auto max-w-[30rem] w-full bg-gray-800 rounded-md p-3">
      <div className="flex items-center gap-x-3">
        <div className="size-10 rounded-full overflow-hidden bg-gray-700">
          {/* Prefer next/image when avatarUrl is local/static, fallback to placeholder */}
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="avatar" className="object-cover object-center size-full" />
          ) : (
            <Image
              src={"/icons/profile.png"}
              alt="profile"
              width={80}
              height={80}
              className="object-cover object-center size-full"
            />
          )}
        </div>
        <div>
          <p className="font-medium">{name || "User"}</p>
          {subtitle && <span className="text-gray-400 text-sm">{subtitle}</span>}
        </div>
      </div>
      <div className="mt-3 whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}
