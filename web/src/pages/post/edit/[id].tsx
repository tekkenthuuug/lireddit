import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withApollo } from '../../../utils/withApollo';
import { useRouter } from 'next/router';
import React from 'react';
import { InputField } from '../../../components/InputField';
import Layout from '../../../components/Layout';
import { useUpdatePostMutation } from '../../../generated/graphql';
import useGetPostFromUrl from '../../../utils/useGetPostFromUrl';

interface Props {}

const Edit: React.FC<Props> = ({}) => {
  const router = useRouter();
  const [{ data, loading }, postId] = useGetPostFromUrl();
  const [updatePost] = useUpdatePostMutation();

  if (loading) {
    return (
      <Layout>
        <div>Loading...</div>
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Couldn't find a post</Box>
      </Layout>
    );
  }

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async values => {
          const { title, text } = values;
          if (text && title) {
            const { errors } = await updatePost({
              variables: { id: postId, ...values },
            });

            if (!errors) {
              router.back();
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField name='title' placeholder='Title' label='Title' />
            <Box mt={4}>
              <InputField
                name='text'
                placeholder='Text...'
                label='Body'
                textarea
              />
            </Box>
            <Box mt={4}>
              <Button
                type='submit'
                isLoading={isSubmitting}
                variantColor='teal'
              >
                Update post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(Edit);
