import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiSlice = createApi({
  reducerPath: 'api',
  // Use environment variable for API URL, fallback to local for development
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }), 
  tagTypes: ['Job', 'Employer'],
  endpoints: (builder) => ({
    // We will add verified hiring endpoints here later
  }),
});