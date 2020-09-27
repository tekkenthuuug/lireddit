import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withApollo } from '../utils/withApollo';
import React from 'react';
import { InputField } from '../components/InputField';
import Layout from '../components/Layout';
import { useCreatePostMutation } from '../generated/graphql';
import { useIsAuth } from '../utils/useIsAuth';
import { useRouter } from 'next/router';

const createPost: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [createPost] = useCreatePostMutation();

  useIsAuth();

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values, { setErrors }) => {
          const { errors } = await createPost({
            variables: { input: values },
            update: cache => {
              cache.evict({ fieldName: 'posts:{}' });
            },
          });

          if (!errors) {
            router.push('/');
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
                Create post
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};

export default withApollo({ ssr: false })(createPost);
