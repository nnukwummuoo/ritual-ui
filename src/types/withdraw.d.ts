export interface WithdrawalRequest {
  _id: string;
  amount: number;
  status: "pending" | "paid";
  requestedAt?: string;
  createdAt?: string;
  credentials?: {
    method?: string;
    fullName?: string;
    accountHolder?: string;
    accountNumber?: string;
    bankName?: string;
    currency?: string;
    email?: string;
    phone?: string;
    country?: string;
  };
}
