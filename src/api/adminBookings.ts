import { URL as API_URL } from './config';

export interface AdminBooking {
  id: string;
  bookingRef: string | null;
  status: string;
  hosttype: string;
  date?: string;
  time?: string;
  place?: string;
  price?: number;
  userid: string;
  creator_portfolio_id: string;
  creatorUserid: string | null;
  fanName: string;
  creatorName: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface AdminBookingsResponse {
  ok: boolean;
  bookings: AdminBooking[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
  };
}

const getAuthToken = (): string => {
  try {
    const raw = localStorage.getItem('login');
    if (raw) {
      const data = JSON.parse(raw);
      return data?.accesstoken || data?.refreshtoken || '';
    }
  } catch {
    // ignore
  }
  return '';
};

const authHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json',
});

export const getAdminBookings = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  hosttype?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<AdminBookingsResponse> => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_URL}/api/admin/bookings?${queryParams.toString()}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch bookings');
  }

  return response.json();
};

export const getAdminBookingConversation = async (
  fanUserid: string,
  creatorUserid: string
): Promise<{ ok: boolean; fanName: string; creatorName: string; messages: { id: string; fromid: string; toid: string; content: string; date: string }[] }> => {
  const queryParams = new URLSearchParams({ fanUserid, creatorUserid });
  const response = await fetch(`${API_URL}/api/admin/bookings/conversation?${queryParams.toString()}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to fetch conversation');
  }

  return response.json();
};

// Reuses the exact same endpoint the fan/creator cancel button calls —
// note the field is "id", not "requestId", matching that existing endpoint.
export const adminCancelBooking = async (id: string, userid: string, creator_portfolio_id: string) => {
  const response = await fetch(`${API_URL}/fanrequest/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userid, creator_portfolio_id }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel booking');
  }
  return data;
};

// Reuses the exact same endpoint the "Mark complete" button calls — note
// this one's field is "requestId", not "id".
export const adminReleasePayment = async (requestId: string, userid: string, creator_portfolio_id: string) => {
  const response = await fetch(`${API_URL}/fanrequest/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, userid, creator_portfolio_id }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Failed to release payment');
  }
  return data;
};