import { ApolloCache } from '@apollo/client';
import { Flex, IconButton } from '@chakra-ui/core';
import gql from 'graphql-tag';
import React, { useState } from 'react';
import {
  Post,
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const updateCacheAfterVote = (
  value: 0 | 1 | -1,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: 'Post:' + postId,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });

  if (data) {
    if (data.voteStatus === value) {
      return;
    }

    let newPoints =
      (data.points as number) + (!data.voteStatus ? 1 : 2) * value;

    if (value === 0 && typeof data.voteStatus === 'number') {
      // removing updoot or downdoot
      newPoints = (data.points as number) - data.voteStatus;
    }

    cache.writeFragment({
      id: 'Post:' + postId,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');
  const [vote] = useVoteMutation();
  return (
    <Flex direction='column' alignItems='center' justifyContent='center' mr={4}>
      <IconButton
        aria-label='Updoot post'
        icon='chevron-up'
        isLoading={loadingState === 'updoot-loading'}
        variantColor={post.voteStatus === 1 ? 'teal' : undefined}
        onClick={async () => {
          setLoadingState('updoot-loading');
          const realValue = post.voteStatus === 1 ? 0 : 1;
          await vote({
            variables: {
              postId: post.id,
              value: realValue,
            },
            update: cache => updateCacheAfterVote(realValue, post.id, cache),
          });
          setLoadingState('not-loading');
        }}
      />
      {post.points}
      <IconButton
        aria-label='Downdoot post'
        icon='chevron-down'
        variantColor={post.voteStatus === -1 ? 'red' : undefined}
        isLoading={loadingState === 'downdoot-loading'}
        onClick={async () => {
          setLoadingState('downdoot-loading');
          const realValue = post.voteStatus === -1 ? 0 : -1;
          await vote({
            variables: {
              postId: post.id,
              value: realValue,
            },
            update: cache => updateCacheAfterVote(realValue, post.id, cache),
          });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};

export default UpdootSection;
