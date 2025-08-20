"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store/store";
import { sendmessage } from "@/store/admin";
import { ToastContainer, toast } from "react-toastify";

export default function MessageUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((s: RootState) => s.register.refreshtoken);
  const selected = useSelector((s: RootState) => s.admin.marked_users) as string[];
  const sending = useSelector((s: RootState) => s.admin.send_stats) === "loading";

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const onSend = async () => {
    if (!selected || selected.length === 0) {
      toast.info("No selected users.", { autoClose: 1500 });
      return;
    }
    if (!message.trim()) {
      toast.info("Type a message.", { autoClose: 1500 });
      return;
    }
    try {
      await dispatch(
        sendmessage({ token, users: selected, subject, message } as any)
      ).unwrap();
      toast.success("Notification sent", { autoClose: 1500 });
    } catch (e: any) {
      toast.error(typeof e === "string" ? e : "Send failed", { autoClose: 2000 });
    }
  };

  return (
    <div className="min-h-screen w-screen mx-auto sm:w-11/12 md:w-10/12 lg:w-9/12 xl:w-8/12 p-4 text-white">
      <ToastContainer position="top-center" theme="dark" />
      <h2 className="text-lg font-bold mb-4">Send Notification</h2>
      <p className="text-xs text-gray-300 mb-4">Recipients: {selected?.length ?? 0}</p>

      <div className="flex flex-col gap-3 max-w-2xl">
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (optional)"
          className="rounded-md bg-slate-700/60 border border-slate-600 px-3 py-2 text-sm placeholder:text-slate-400"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message"
          rows={6}
          className="rounded-md bg-slate-700/60 border border-slate-600 px-3 py-2 text-sm placeholder:text-slate-400"
        />
        <button
          disabled={sending}
          onClick={onSend}
          className="self-start bg-blue-600 hover:bg-blue-500 disabled:opacity-60 px-4 py-2 rounded-md text-sm font-semibold"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
