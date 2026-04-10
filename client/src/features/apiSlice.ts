import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Use environment variable for API URL
// Localhost: http://localhost:5000
// Server: https://api.click4jobs.in
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};
const API_URL = getApiUrl();

export const apiSlice = createApi({
  reducerPath: 'api',
  // baseUrl is now generic, allowing access to all route groups
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }), 
  tagTypes: ['Job', 'Employer'],
  endpoints: (builder) => ({
    requestGstVerification: builder.mutation<any, { employerId: string; gstNumber: string }>(
      {
        // Full path starting with /auth because it's no longer in the baseUrl
        query: (body) => ({ url: '/auth/employer/request-gst-verification', method: 'POST', body }),
        invalidatesTags: ['Employer'],
      },
    ),
    getPendingGstVerifications: builder.query<any, void>({
      // Full path starting with /auth
      query: () => '/auth/admin/gst-verifications/pending',
      providesTags: ['Employer'],
    }),
    updateGstVerificationStatus: builder.mutation<any, { employerId: string; status: 'approved' | 'rejected'; adminId: string }>(
      {
        // Full path starting with /auth
        query: (body) => ({ url: '/auth/admin/gst-verifications/update-status', method: 'PATCH', body }),
        invalidatesTags: ['Employer'],
      },
    ),
  }),
});

export const { 
  useRequestGstVerificationMutation, 
  useGetPendingGstVerificationsQuery, 
  useUpdateGstVerificationStatusMutation 
} = apiSlice;