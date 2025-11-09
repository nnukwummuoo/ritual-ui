import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../api/config"
import axios from "axios";

const initialState = {
    likestatus:'idle',
    error: ""
}

export const postlike = createAsyncThunk("like/postlike",async data=>{
    console.log("🔥 [REDUX] LIKE ACTION TRIGGERED");
    console.log("📊 [REDUX] Sending like data to backend:", data);
    console.log("📡 [REDUX] API URL:", `${URL}/like`);
    console.log("🔧 [REDUX] Request method: PUT");
    console.log("🌐 [REDUX] Current environment:", process.env.NODE_ENV);
    console.log("🌐 [REDUX] Window location:", typeof window !== 'undefined' ? window.location.href : 'server-side');
    console.log("🌐 [REDUX] Full request URL:", `${URL}/like`);
    
    try{
        console.log("🚀 [REDUX] Making axios request...");
        
        let response = await axios.put(`${URL}/like`,data)
        console.log("✅ [REDUX] Backend response received:", response);
        console.log("📄 [REDUX] Response status:", response.status);
        console.log("📄 [REDUX] Response data:", response.data);
        console.log("📄 [REDUX] Response headers:", response.headers);
        return response.data
    }catch (err: unknown) {
        console.error("❌ [REDUX] Like request failed:", err);
        
        if (axios.isAxiosError(err)) {
            console.error("❌ [REDUX] Axios error details:", {
                message: err.message,
                status: err.response?.status,
                statusText: err.response?.statusText,
                data: err.response?.data,
                config: {
                    url: err.config?.url,
                    method: err.config?.method,
                    data: err.config?.data
                }
            });
            const msg = (err.response?.data as any)?.message ?? err.message ?? "Check internet connection";
            throw new Error(msg);
        }
        const msg = (err as Error)?.message ?? "Unknown error";
        console.error("❌ [REDUX] Non-axios error:", msg);
        throw new Error(msg);
    }
})



const like = createSlice({
    name:"like",
    initialState,
    reducers:{
        chagelikestatus(state,action){
            state.likestatus = action.payload
            
        }
    },
    extraReducers(builder){

        builder.addCase(postlike.pending,(state,action)=>{
            console.log("🔄 [REDUX] Like action pending...");
            state.likestatus = 'loading'
            
        }
        )
        .addCase(postlike.fulfilled,(state,action)=>{
            console.log("✅ [REDUX] Like action fulfilled:", action.payload);
            state.likestatus = 'succeeded'
          
           
        }

        )
        .addCase(postlike.rejected,(state,action)=>{
            console.error("❌ [REDUX] Like action rejected:", action.error);
            state.likestatus = 'failed'
            state.error = action.error?.message ?? "Check internet connection"
        }

        )
    }
})

export default like.reducer;
export const {chagelikestatus} = like.actions;