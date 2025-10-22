import { URL as API_URL } from './config';

export interface Web3PaymentRequest {
  amount: number;
  userId: string;
  order_description?: string;
}

export interface Web3PaymentResponse {
  message: string;
  orderId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  network: string;
  contractAddress: string;
  expiresAt: string;
  instructions: string;
}

export interface PaymentStatusResponse {
  orderId: string;
  status: 'waiting' | 'confirming' | 'confirmed' | 'finished' | 'failed' | 'expired' | 'cancelled';
  amount: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  txData?: {
    fromAddress?: string;
    toAddress?: string;
    confirmedAt?: string;
    txHash?: string;
    blockNumber?: number;
    gasUsed?: string;
    timestamp?: number;
    verifiedVia?: string;
    network?: string;
    contractAddress?: string;
    paymentMethod?: string;
  };
}

export interface WalletBalanceResponse {
  walletAddress: string;
  balance: number;
  currency: string;
  network: string;
}

/**
 * Create a Web3 payment request
 */
export const createWeb3Payment = async (data: Web3PaymentRequest): Promise<Web3PaymentResponse> => {
  const response = await fetch(`${API_URL}/web3/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create Web3 payment');
  }

  return response.json();
};

/**
 * Check payment status by order ID
 */
export const checkWeb3PaymentStatus = async (orderId: string): Promise<PaymentStatusResponse> => {
  console.log(`🌐 [API CLIENT] Making request to: ${API_URL}/web3/status/${orderId}`);
  console.log(`🌐 [API CLIENT] Request timestamp: ${new Date().toISOString()}`);
  
  const response = await fetch(`${API_URL}/web3/status/${orderId}`);

  console.log(`🌐 [API CLIENT] Response received:`);
  console.log(`🌐 [API CLIENT] - Status: ${response.status}`);
  console.log(`🌐 [API CLIENT] - OK: ${response.ok}`);
  console.log(`🌐 [API CLIENT] - Headers:`, Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    const error = await response.json();
    console.error(`❌ [API CLIENT] Error response:`, error);
    throw new Error(error.message || 'Failed to check payment status');
  }

  const data = await response.json();
  console.log(`✅ [API CLIENT] Success response:`, data);
  return data;
};

/**
 * Get wallet USDT balance
 */
export const getWalletBalance = async (walletAddress: string): Promise<WalletBalanceResponse> => {
  const response = await fetch(`${API_URL}/web3/balance/${walletAddress}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get wallet balance');
  }

  return response.json();
};

/**
 * Cancel a Web3 payment transaction
 */
export const cancelWeb3Payment = async (orderId: string): Promise<{ message: string; status: string }> => {
  const response = await fetch(`${API_URL}/web3/cancel/${orderId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to cancel payment');
  }

  return response.json();
};

/**
 * Verify transaction hash and confirm payment
 */
export const verifyTransactionHash = async (orderId: string, txHash: string): Promise<{
  message: string;
  status: string;
  orderId: string;
  amount: number;
  txHash: string;
  fromAddress: string;
}> => {
  const response = await fetch(`${API_URL}/web3/verify-tx`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderId, txHash }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to verify transaction hash');
  }

  return response.json();
};
