/* eslint-disable @typescript-eslint/no-explicit-any */
import { URL as API_URL } from './config';

export interface Transaction {
  _id: string;
  orderId: string;
  userId: string;
  username?: string;
  amount: number;
  payCurrency: string;
  status: string;
  description: string;
  invoiceUrl?: string;
  txData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  _id: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
}

export interface TransactionResponse {
  success: boolean;
  transactions: Transaction[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: TransactionStats[];
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
  };
}

/**
 * Get all transactions with filtering and pagination
 */
export const getTransactions = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<TransactionResponse> => {
  const token = (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.accesstoken || data?.refreshtoken;
      }
    } catch (error) {
      console.error("Error retrieving token from localStorage:", error);
    }
    return "";
  })();

  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/api/admin/transactions?${queryParams.toString()}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transactions');
  }

  return response.json();
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (id: string): Promise<{ success: boolean; transaction: Transaction }> => {
  const token = (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.accesstoken || data?.refreshtoken;
      }
    } catch (error) {
      console.error("Error retrieving token from localStorage:", error);
    }
    return "";
  })();

  const response = await fetch(`${API_URL}/api/admin/transactions/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transaction');
  }

  return response.json();
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (id: string, status: string, notes?: string): Promise<{ success: boolean; message: string; transaction: Transaction }> => {
  const token = (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.accesstoken || data?.refreshtoken;
      }
    } catch (error) {
      console.error("Error retrieving token from localStorage:", error);
    }
    return "";
  })();

  const response = await fetch(`${API_URL}/api/admin/transactions/${id}/status`, {
    method: 'PUT',
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ status, notes })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update transaction status');
  }

  return response.json();
};

/**
 * Get transaction statistics
 */
export const getTransactionStats = async (period: '7d' | '30d' | '90d' = '30d'): Promise<{
  success: boolean;
  period: string;
  stats: TransactionStats[];
  dailyStats: any[];
  revenue: {
    totalRevenue: number;
    totalTransactions: number;
  };
}> => {
  const token = (() => {
    try {
      const raw = localStorage.getItem("login");
      if (raw) {
        const data = JSON.parse(raw);
        return data?.accesstoken || data?.refreshtoken;
      }
    } catch (error) {
      console.error("Error retrieving token from localStorage:", error);
    }
    return "";
  })();

  const response = await fetch(`${API_URL}/api/admin/transactions/stats/overview?period=${period}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch transaction statistics');
  }

  return response.json();
};
