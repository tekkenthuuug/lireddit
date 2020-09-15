import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { usePostsQuery } from '../generated/graphql';
import Layout from '../components/Layout';
import { Link, Stack, Box, Heading, Text, Flex, Button } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useState } from 'react';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!fetching && !data) {
    return <div>You got query failed for some reason</div>;
  }

  return (
    <Layout>
      <Flex justifyContent='space-between' alignItems='center'>
        <Heading>LiReddit</Heading>
        <NextLink href='/create-post'>
          <Link>Create post</Link>
        </NextLink>
      </Flex>
      <br />
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map(post => (
            <Box key={post.id} shadow='md' p={5} borderWidth='1px'>
              <Heading fontSize='xl'>{post.title}</Heading>
              <Text>Posted by: {post.creator.username}</Text>
              <Text mt={4}>{post.textSnippet}</Text>
            </Box>
          ))}
        </Stack>
      )}

      {data && data?.posts.hasMore && (
        <Flex mt={4} justifyContent='center'>
          <Button
            onClick={() => {
              setVariables(vars => ({
                ...vars,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              }));
            }}
            isLoading={fetching}
            width='140px'
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
