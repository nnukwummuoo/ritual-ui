import { configureStore } from '@reduxjs/toolkit';
import followingReducer from './followingSlice';
import goldstatReducer from './goldstatSlice';
import profileReducer from './profile';
import registerReducer from './registerSlice';
import messageReducer from './messageSlice';

export const store = configureStore({
  reducer: {
    following: followingReducer,
    goldstat: goldstatReducer,
    profile: profileReducer,
    register: registerReducer,
    message: messageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
