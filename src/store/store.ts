import { configureStore } from '@reduxjs/toolkit';
import followingReducer from './followingSlice';
import goldstatReducer from './goldstatSlice';
import creatorSlice from './creatorSlice';
import requestSlice from './requests';
import registerReducer from './registerSlice';
import profileReducer from './profile';
import viewingProfileReducer from './viewingProfile';

import messageReducer from './messageSlice';
import comprofileReducer from './comprofile';
import postReducer from './post';
import commentReducer from './comment';
import adminReducer from './admin';
import vipReducer from './vip';


export const store = configureStore({
  reducer: {
    following: followingReducer,
    goldstat: goldstatReducer,
    creator: creatorSlice,
    request:requestSlice,
    profile: profileReducer,
    viewingProfile: viewingProfileReducer,
    register: registerReducer,
    message: messageReducer,
    comprofile: comprofileReducer,
    post:postReducer,
    comment:commentReducer,
    admin: adminReducer,
    vip: vipReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
