import { URL as API_URL } from './config';

export interface VipCelebrationResponse {
  ok: boolean;
  shouldShowCelebration: boolean;
  monthKey?: string;
  lastViewedMonth?: string;
  reason?: string;
}

export interface MarkViewedResponse {
  ok: boolean;
  message: string;
  monthKey: string;
}

// Check if VIP celebration should be shown
export const checkVipCelebration = async (
  userid: string, 
  viewerid: string, 
  token: string
): Promise<VipCelebrationResponse> => {
  try {
    const response = await fetch(`${API_URL}/vip/celebration/check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userid, viewerid })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking VIP celebration:', error);
    return {
      ok: false,
      shouldShowCelebration: false,
      reason: 'Network error'
    };
  }
};

// Mark VIP celebration as viewed
export const markVipCelebrationViewed = async (
  userid: string, 
  viewerid: string, 
  token: string
): Promise<MarkViewedResponse> => {
  try {
    const response = await fetch(`${API_URL}/vip/celebration/mark-viewed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ userid, viewerid })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error marking VIP celebration as viewed:', error);
    return {
      ok: false,
      message: 'Network error',
      monthKey: ''
    };
  }
};
