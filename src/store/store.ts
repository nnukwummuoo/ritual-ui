import { configureStore } from '@reduxjs/toolkit';
import followingReducer from './followingSlice';
import goldstatReducer from './goldstatSlice';
import modelSlice from './modelSlice';
import bookingSlice from './booking';

import profileReducer from './profile';
import registerReducer from './registerSlice';
import messageReducer from './messageSlice';
import comprofileReducer from './comprofile';

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
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
