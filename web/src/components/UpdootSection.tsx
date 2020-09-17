import { Flex, IconButton } from '@chakra-ui/core';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

interface UpdootSectionProps {
  post: PostSnippetFragment;
}

const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');
  const [, vote] = useVoteMutation();
  return (
    <Flex direction='column' alignItems='center' justifyContent='center' mr={4}>
      <IconButton
        aria-label='Updoot post'
        icon='chevron-up'
        isLoading={loadingState === 'updoot-loading'}
        variantColor={post.voteStatus === 1 ? 'teal' : undefined}
        onClick={async () => {
          setLoadingState('updoot-loading');
          await vote({
            postId: post.id,
            value: post.voteStatus === 1 ? 0 : 1,
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
          await vote({
            postId: post.id,
            value: post.voteStatus === -1 ? 0 : -1,
          });
          setLoadingState('not-loading');
        }}
      />
    </Flex>
  );
};

export default UpdootSection;
