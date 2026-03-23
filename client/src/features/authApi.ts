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
  }),
});

export const { useRegisterMutation, useLoginMutation, useUpdateProfileMutation } = authApi;