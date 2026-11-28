import React from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

type Status = "completed" | "pending" | "failed";

interface HistoryCardProps {
  name: string;
  amount: string;
  date: string;
  status: Status;
}

const statusPill: Record<Status, string> = {
  completed: "border-[#22c55e]/25 bg-[#0f2a22] text-[#a7e3c4]",
  pending: "border-yellow-500/25 bg-[#2a2310] text-yellow-400",
  failed: "border-red-500/25 bg-[#2a1216] text-red-300",
};

const HistoryCard: React.FC<HistoryCardProps> = ({ name, amount, date, status }) => {
  // Determine if this is a positive or negative transaction
  const isPositive = amount.startsWith('+');
  const isNegative = amount.startsWith('-');

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0d1220] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isPositive ? "bg-[#0f2a22] text-green-400" : isNegative ? "bg-[#2a1216] text-red-400" : "bg-[#161b2e] text-slate-300"
          }`}
        >
          {isNegative ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-white">{name}</h4>
          <p className="mt-0.5 text-xs text-slate-500">{date}</p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className={`font-extrabold ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white'}`}>
          {amount}
        </p>
        <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${statusPill[status]}`}>
          {status}
        </span>
      </div>
    </div>
  );
};

export default HistoryCard;