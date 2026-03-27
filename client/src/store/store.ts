import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/apiSlice';
import { jobApi } from '../features/jobapi';
import { chatApi } from '../features/chatApi';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    [jobApi.reducerPath]: jobApi.reducer,
    [chatApi.reducerPath]: chatApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware, jobApi.middleware, chatApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;