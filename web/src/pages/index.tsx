import { Box, Button, Flex, Heading, Link, Stack, Text } from '@chakra-ui/core';
import { withApollo } from '../utils/withApollo';
import NextLink from 'next/link';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import { useMeQuery, usePostsQuery } from '../generated/graphql';

const Index = () => {
  const { data: meData } = useMeQuery();

  const { data, loading, fetchMore, error, variables: vars } = usePostsQuery({
    variables: {
      limit: 15,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return <div>{error?.message}</div>;
  }

  return (
    <Layout>
      <br />
      {!data && loading ? (
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
                      {meData?.me?.id === post.creator.id && (
                        <EditDeletePostButtons id={post.id} />
                      )}
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
              fetchMore({
                variables: {
                  ...vars,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                },
              });
            }}
            isLoading={loading}
            width='140px'
          >
            Load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
