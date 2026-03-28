import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' 
  }),
  tagTypes: ['Job', 'Notification', 'Application'], // 'Application' tag add kiya
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
    // Naya Apply Endpoint yahan hai
    applyForJob: builder.mutation({
      query: (applicationData) => ({
        url: '/jobs/apply',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['Application', 'Job'], // Added 'Job' to refresh the job list
    }),
    updateApplicantStatus: builder.mutation({
      query: (data) => ({
        url: '/jobs/applicant-status',
        method: 'PATCH',
        body: data,
      }),
    }),
    getNotifications: builder.query({
      query: (userId) => `/auth/notifications/${userId}`,
      providesTags: ['Notification'],
    }),
    markNotificationsAsRead: builder.mutation({
      query: (userId) => ({
        url: `/auth/notifications/${userId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

// useApplyForJobMutation ko export list mein add kiya
export const { 
  usePostJobMutation, 
  useGetJobsByEmployerQuery, 
  useGetAllJobsQuery, 
  useGetCompanyByIdQuery, 
  useDeleteJobMutation, 
  useApplyForJobMutation, // Ab yeh dashboard mein mil jayega
  useUpdateApplicantStatusMutation,
  useGetNotificationsQuery, 
  useMarkNotificationsAsReadMutation 
} = jobApi;