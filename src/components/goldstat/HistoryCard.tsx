import React from "react";

type Status = "completed" | "pending" | "failed";

interface HistoryCardProps {
  name: string;
  amount: string;
  date: string;
  status: Status;
}

const statusColor: Record<Status, string> = {
  completed: "text-green-600",
  pending: "text-yellow-600",
  failed: "text-red-600",
};

const HistoryCard: React.FC<HistoryCardProps> = ({ name, amount, date, status }) => {
  // Determine if this is a positive or negative transaction
  const isPositive = amount.startsWith('+');
  const isNegative = amount.startsWith('-');
  
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-md flex justify-between items-center">
      <div>
        <h4 className="font-semibold text-white">{name}</h4>
        <p className="text-sm text-gray-400">{date}</p>
      </div>
      <div className="text-right">
        <p className={`font-bold ${isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-white'}`}>
          {amount}
        </p>
        <p className={`text-sm ${statusColor[status]}`}>{status}</p>
      </div>
    </div>
  );
};

export default HistoryCard;