import axios from "axios";
import { URL } from "./config";

export const getPaymentLink = async (amount : number ) => {
  const amountToPay = Number(amount) * 56.6 * 100;
  try {
    const res = await axios.post(`${URL}/payment/create`, {
      amount: amountToPay,
    });
    return res.data;
  } catch (error: any) {
    console.log(error);
    return error?.message;
  }
};
