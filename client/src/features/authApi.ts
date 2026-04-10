import { apiSlice } from './apiSlice';

export const authApi = apiSlice.injectEndpoints({
  overrideExisting: true, // Good practice for injected endpoints
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register', // Added /auth prefix
        method: 'POST',
        body,
      }),
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login', // Added /auth prefix
        method: 'POST',
        body,
      })
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/auth/update', // Added /auth prefix
        method: 'PATCH',
        body,
      }),
    }),
    toggleFollowCompany: builder.mutation({
      query: ({ companyId, candidateId }) => ({
        url: `/auth/follow/${companyId}`, // Added /auth prefix
        method: 'PATCH',
        body: { userId: candidateId },
      }),
    }),
  }),
});

export const { 
  useRegisterMutation, 
  useLoginMutation, 
  useUpdateProfileMutation, 
  useToggleFollowCompanyMutation 
} = authApi;