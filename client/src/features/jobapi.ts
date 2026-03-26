import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' 
  }),
  tagTypes: ['Job'],
  endpoints: (builder) => ({
    postJob: builder.mutation({
      query: (jobData) => ({
        url: '/jobs/create',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Job'],
    }),
    getJobsByEmployer: builder.query({
      query: (employerId) => `/jobs/employer/${employerId}`,
      providesTags: ['Job'],
    }),
    getAllJobs: builder.query({
      query: () => '/jobs/all',
      providesTags: ['Job'],
    }),
    getCompanyById: builder.query({
      query: (companyId) => `/company/${companyId}`,
    }),
    deleteJob: builder.mutation({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Job'],
    }),
  }),
});

export const { usePostJobMutation, useGetJobsByEmployerQuery, useGetAllJobsQuery, useGetCompanyByIdQuery, useDeleteJobMutation } = jobApi;