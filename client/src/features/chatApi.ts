import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000' }),
  tagTypes: ['Chat'],
  endpoints: (builder) => ({
    getMessages: builder.query<any, { user1: string; user2: string }>({
      query: ({ user1, user2 }) => `/chat/${user1}/${user2}`,
      providesTags: ['Chat'],
    }),
    sendMessage: builder.mutation<any, { senderId: string; receiverId: string; message: string }>({
      query: (body) => ({
        url: `/chat/send`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;