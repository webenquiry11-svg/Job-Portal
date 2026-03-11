import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  // Note: Using your local server port 5000
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:5000' }), 
  tagTypes: ['Job', 'Employer'],
  endpoints: (builder) => ({
    // We will add verified hiring endpoints here later
  }),
});