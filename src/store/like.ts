import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { URL } from "../api/config"
import axios from "axios";

const initialState = {
    likestatus:'idle',
    error: ""
}

export const postlike = createAsyncThunk("like/postlike",async data=>{
   
    try{
     
        //console.log('ontop get profile')
        let response = await axios.put(`${URL}/like`,data)
       // console.log('under get profile')
       

        return response.data

        
    }catch (err: unknown) {
        // Properly narrow unknown error and surface a safe message
        if (axios.isAxiosError(err)) {
            const msg = (err.response?.data as any)?.message ?? err.message ?? "Check internet connection";
            throw new Error(msg);
        }
        const msg = (err as Error)?.message ?? "Unknown error";
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
            state.likestatus = 'loading'
            
        }
        )
        .addCase(postlike.fulfilled,(state,action)=>{

            state.likestatus = 'succeeded'
          
           
        }

        )
        .addCase(postlike.rejected,(state,action)=>{
            state.likestatus = 'failed'
            state.error = action.error?.message ?? "Check internet connection"
        }

        )
    }
})

export default like.reducer;
export const {chagelikestatus} = like.actions;