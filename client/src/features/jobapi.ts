import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const jobApi = createApi({
  reducerPath: 'jobApi',
  baseQuery: fetchBaseQuery({ 
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' 
  }),
  tagTypes: ['Job', 'Notification', 'Company', 'Application'],
  endpoints: (builder) => ({
    // Job endpoints
    postJob: builder.mutation<any, any>({
      query: (jobData) => ({
        url: '/jobs/create',
        method: 'POST',
        body: jobData,
      }),
      invalidatesTags: ['Job'],
    }),
    getJobsByEmployer: builder.query<any, string>({
      query: (employerId) => `/jobs/employer/${employerId}`,
      providesTags: ['Job'],
    }),
    getAllJobs: builder.query<any, void>({
      query: () => '/jobs/all',
      providesTags: ['Job'],
    }),
    deleteJob: builder.mutation<any, string>({
      query: (jobId) => ({
        url: `/jobs/${jobId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Job'],
    }),
    
    // Application/Status endpoints
    applyForJob: builder.mutation<any, any>({
      query: (applicationData) => ({
        url: '/jobs/apply',
        method: 'POST',
        body: applicationData,
      }),
      invalidatesTags: ['Application', 'Job'],
    }),
    updateApplicantStatus: builder.mutation<any, any>({
      query: (data) => ({
        url: '/jobs/status',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Job'],
    }),
    scheduleInterview: builder.mutation<any, any>({
      query: (data) => ({
        url: '/jobs/schedule-interview',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Job'],
    }),

    // Notification endpoints
    getNotifications: builder.query<any, string>({
      query: (userId) => `/auth/notifications/${userId}`,
      providesTags: ['Notification'],
    }),
    markNotificationsAsRead: builder.mutation<any, string>({
      query: (userId) => ({
        url: `/auth/notifications/read/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),

    // Company/Profile endpoints
    getCompanyById: builder.query<any, string>({
      query: (companyId) => `/auth/company/${companyId}`,
      providesTags: (result, error, id) => [{ type: 'Company', id }],
    }),
    incrementProfileView: builder.mutation<{ profileViews: number }, string>({
      query: (userId) => ({
        url: `/auth/profile/view/${userId}`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'Company', id }],
    }),

    // Admin
    getAllUsersForAdmin: builder.query<any[], void>({
      query: () => '/auth/admin/all-users',
      providesTags: ['Company'], // Or a new 'User' tag
    }),
    getPendingGstVerifications: builder.query<any[], void>({
      query: () => '/auth/admin/gst-verifications/pending',
      providesTags: ['Company'],
    }),
    updateGstVerificationStatus: builder.mutation<any, { employerId: string; status: string }>({
      query: (body) => ({
        url: '/auth/admin/gst-verifications/update-status',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Company'],
    }),

    // Account Deletion Mutations (Consider moving to authApi.ts)
    requestDeleteOtp: builder.mutation<any, { _id: string }>({
      query: (body) => ({
        url: '/auth/request-delete-otp',
        method: 'POST',
        body,
      }),
    }),
    deleteAccount: builder.mutation<any, { _id: string; otp: string }>({
      query: (body) => ({
        url: '/auth/delete-account',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { 
  usePostJobMutation, 
  useGetJobsByEmployerQuery, 
  useGetAllJobsQuery, 
  useGetCompanyByIdQuery, 
  useDeleteJobMutation, 
  useApplyForJobMutation, // Ab yeh dashboard mein mil jayega
  useUpdateApplicantStatusMutation,
  useScheduleInterviewMutation,
  useGetNotificationsQuery, 
  useMarkNotificationsAsReadMutation,
  useIncrementProfileViewMutation,
  useGetAllUsersForAdminQuery,
  useGetPendingGstVerificationsQuery,
  useUpdateGstVerificationStatusMutation,
  useRequestDeleteOtpMutation,
  useDeleteAccountMutation,
} = jobApi;