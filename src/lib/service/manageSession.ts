"use server"
import { NextRequest, NextResponse } from "next/server";
import {jwtVerify, SignJWT} from "jose"
import axios from "axios";


export type user = {email: string, password: string}
export type payload = {user: user}

const secrete = process.env.NEXT_PUBLIC_SCERET
const key = new TextEncoder().encode(secrete)
let credentials: user | false
let timeout_id: ReturnType<typeof setTimeout>

export async function encryptData(payload:payload ) {
    return await new SignJWT(payload)
    .setProtectedHeader({alg: "HS256"})
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(key)
}

export async function decryptData(input: string): Promise<{ status: string; body: user }> {
  try {
    const { payload } = await jwtVerify(input, key, { algorithms: ["HS256"] })
    const typedPayload = payload as payload
    console.log({ decryptData: payload, input })
    return { status: "valid", body: typedPayload.user }
  } catch (error: any) {
    console.log(error)
    return { status: "expired", body: error?.payload?.user ?? { email: "", password: "" } }
  }
}

export async function isRegistered(payload: {email: string, password: string, }): Promise<any | undefined> {
    try{
       
        const res = await axios.post(`${process.env.NEXT_PUBLIC_API}/login`, payload, {withCredentials: true});
        const user = await res.data.user;
        // console.log(user)
        // if (!user.email) return undefined;
        return user;
    }catch(error){
        console.log(error)
        credentials = false
        return undefined
    }
}

export async function sessionMng(request: NextRequest): Promise<string | undefined> {
    const cookie = request.cookies.get("session")?.value
    if(!cookie?.length) return undefined
    const decryptCookie = await decryptData(String(cookie))
    if(decryptCookie?.status === "valid") return undefined
    // expired -> refresh directly and return new token
    const refreshed = await encryptData({ user: decryptCookie.body })
    return refreshed
}   
