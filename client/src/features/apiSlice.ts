import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiSlice = createApi({
  reducerPath: 'api',
  // Use environment variable for API URL, fallback to local for development
  baseQuery: fetchBaseQuery({ baseUrl: `${API_URL}/auth` }), 
  tagTypes: ['Job', 'Employer'],
  endpoints: (builder) => ({
    requestGstVerification: builder.mutation<any, { employerId: string; gstNumber: string }>(
      {
        query: (body) => ({ url: '/employer/request-gst-verification', method: 'POST', body }),
        invalidatesTags: ['Employer'],
      },
    ),
    getPendingGstVerifications: builder.query<any, void>({
      query: () => '/admin/gst-verifications/pending',
      providesTags: ['Employer'],
    }),
    updateGstVerificationStatus: builder.mutation<any, { employerId: string; status: 'approved' | 'rejected'; adminId: string }>(
      {
        query: (body) => ({ url: '/admin/gst-verifications/update-status', method: 'PATCH', body }),
        invalidatesTags: ['Employer'],
      },
    ),
  }),
});

export const { useRequestGstVerificationMutation, useGetPendingGstVerificationsQuery, useUpdateGstVerificationStatusMutation } = apiSlice;