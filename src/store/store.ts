import { configureStore } from '@reduxjs/toolkit';
import followingReducer from './followingSlice';
import goldstatReducer from './goldstatSlice';
import modelSlice from './modelSlice';
import bookingSlice from './booking';
import registerReducer from './registerSlice';
import profileReducer from './profile';

import messageReducer from './messageSlice';
import comprofileReducer from './comprofile';
import postReducer from './post';
import commentReducer from './comment';
import adminReducer from './admin';


export const store = configureStore({
  reducer: {
    following: followingReducer,
    goldstat: goldstatReducer,
    model: modelSlice,
    booking:bookingSlice,
    profile: profileReducer,
    register: registerReducer,
    message: messageReducer,
    comprofile: comprofileReducer,
    post:postReducer,
    comment:commentReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
