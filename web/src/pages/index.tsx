import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import { useDeletePostMutation, usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return <div>You got query failed for some reason</div>;
  }

  return (
    <Layout>
      <br />
      {!data && fetching ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data!.posts.posts.map(
            post =>
              post && (
                <Flex key={post.id} shadow='md' p={5} borderWidth='1px'>
                  <UpdootSection post={post} />
                  <Box flex={1}>
                    <NextLink href='/post/[id]' as={`/post/${post.id}`}>
                      <Link>
                        <Heading fontSize='xl'>{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text>Posted by: {post.creator.username}</Text>
                    <Flex justifyContent='space-between' alignItems='center'>
                      <Text flex={1} mt={4}>
                        {post.textSnippet}
                      </Text>
                      <IconButton
                        icon='delete'
                        variantColor='red'
                        aria-label='Delete post'
                        onClick={() => {
                          deletePost({ id: post.id });
                        }}
                      />
                    </Flex>
                  </Box>
                </Flex>
              )
          )}
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
