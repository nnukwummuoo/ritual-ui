import { configureStore } from '@reduxjs/toolkit';
import followingReducer from './followingSlice';
import goldstatReducer from './goldstatSlice';
import modelSlice from './modelSlice';
import bookingSlice from './booking';
import registerReducer from './registerSlice';
import profileReducer from './profile';


export const store = configureStore({
  reducer: {
    following: followingReducer,
    goldstat: goldstatReducer,
    model: modelSlice,
    booking:bookingSlice,
    register:registerReducer,
    profile:profileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
