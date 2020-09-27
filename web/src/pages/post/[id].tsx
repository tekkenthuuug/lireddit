import { Box, Heading } from '@chakra-ui/core';
import { withApollo } from '../../utils/withApollo';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { useMeQuery } from '../../generated/graphql';
import useGetPostFromUrl from '../../utils/useGetPostFromUrl';

const Post = ({}) => {
  const [{ data: postData, loading }] = useGetPostFromUrl();
  const { data: meData } = useMeQuery();
  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!postData?.post) {
    return (
      <Layout>
        <Box>Couldn't find a post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{postData.post.title}</Heading>
      <Box mb={4}>{postData.post?.text}</Box>
      {meData?.me?.id === postData.post.creatorId && (
        <EditDeletePostButtons id={postData.post.id} />
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
