import axios from "axios";
import { URL } from "./config";

export const getPaymentLink = async (
  amount: number,
  userId: string,
  pay_currency: string = "usdtbsc",
  order_description: string = "Gold Pack Purchase",
) => {
  try {
    const amountToPay = Number(amount).toFixed(2); // NOWPayments expects amount in crypto units
    const res = await axios.post(`${URL}/payment/create`, {
      userId,
      amount: amountToPay,
      pay_currency,
      order_description,
    });
    return res.data;
  } catch (error: any) {
    console.log(error);
    return { message: error?.response?.data?.message || error.message };
  }
};