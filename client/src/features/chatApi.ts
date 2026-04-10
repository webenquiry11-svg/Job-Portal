import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Consistent with your other files
const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return 'http://localhost:5000';
};
const API_URL = getApiUrl();

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  tagTypes: ['Chat'],
  endpoints: (builder) => ({
    getMessages: builder.query<any, { user1: string; user2: string }>({
      // Matches backend: app.use('/chat', chatRoute)
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
    markAsSeen: builder.mutation<any, { senderId: string; receiverId: string }>({
      query: (body) => ({
        url: `/chat/seen`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Chat'],
    }),
    getConversations: builder.query<any, string>({
      query: (userId) => `/chat/conversations/${userId}`,
      providesTags: ['Chat'],
    }),
    getUnreadMessageCount: builder.query<{ count: number }, string>({
      query: (userId) => `/chat/unread-count/${userId}`,
      providesTags: ['Chat'],
    }),
  }),
});

export const { 
  useGetMessagesQuery, 
  useSendMessageMutation, 
  useMarkAsSeenMutation, 
  useGetConversationsQuery, 
  useGetUnreadMessageCountQuery 
} = chatApi;