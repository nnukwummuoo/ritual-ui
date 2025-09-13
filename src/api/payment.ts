import axios from "axios";
import { URL } from "./config";

export const getPaymentLink = async (
  amount: number,
  userid: string,
  pay_currency: string = "usdtbep20",
  order_description: string = "Gold Pack Purchase",
  customer_email?: string
) => {
  try {
    const amountToPay = Number(amount).toFixed(2); // NOWPayments expects amount in crypto units
    const res = await axios.post(`${URL}/payment/create`, {
      userid,
      amount: amountToPay,
      pay_currency,
      order_description,
      customer_email,
    });
    return res.data;
  } catch (error: any) {
    console.log(error);
    return { message: error?.response?.data?.message || error.message };
  }
};