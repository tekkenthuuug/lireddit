import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from '@apollo/client';
import { NextPageContext } from 'next';
import { PaginatedPosts } from '../generated/graphql';
import { createWithApollo } from './createWithApollo';

import { onError } from '@apollo/client/link/error';
import Router from 'next/router';

const errorLink = onError(({ graphQLErrors, response }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message }) => {
      if (message === 'not authenticated' && response) {
        response.errors = undefined;

        Router.replace('/login');
      }
    });
  }
});

const httpLink = (ctx: NextPageContext) =>
  new HttpLink({
    uri: process.env.NEXT_PUBLIC_API_URL,
    credentials: 'include',
    headers: {
      cookie:
        (typeof window === 'undefined'
          ? ctx?.req?.headers.cookie
          : undefined) || '',
    },
  });

const link = (ctx: NextPageContext) =>
  ApolloLink.from([errorLink, httpLink(ctx)]);

const createClient = (ctx: NextPageContext) =>
  new ApolloClient({
    link: link(ctx),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            posts: {
              keyArgs: [],
              merge(
                existing: PaginatedPosts | undefined,
                incoming: PaginatedPosts
              ) {
                return {
                  ...incoming,
                  posts: [...(existing?.posts || []), ...incoming.posts],
                };
              },
            },
          },
        },
      },
    }),
  });

export const withApollo = createWithApollo(createClient);
