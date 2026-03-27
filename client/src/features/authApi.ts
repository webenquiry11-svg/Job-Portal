import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/register',
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/login',
        method: 'POST',
        body,
      })
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/update',
        method: 'PATCH',
        body,
      }),
    }),
    toggleFollowCompany: builder.mutation({
      query: ({ companyId, candidateId }) => ({
        url: `/follow/${companyId}`,
        method: 'PATCH',
        // This is not ideal, but necessary without auth middleware
        body: { userId: candidateId },
      }),
    }),
  }),
});

export const { useRegisterMutation, useLoginMutation, useUpdateProfileMutation, useToggleFollowCompanyMutation } = authApi;