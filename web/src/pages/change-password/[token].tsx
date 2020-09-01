import { Button, Box, Link, Flex } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { InputField } from '../../components/InputField';
import { Wrapper } from '../../components/Wrapper';
import { useChangePasswordMutation } from '../../generated/graphql';
import { toErrorMap } from '../../utils/toErrorMap';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';

interface changePasswordParams {
  token: string;
}

const ChangePassword: NextPage<changePasswordParams> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.password,
            token,
          });

          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data?.changePassword.errors);

            if ('token' in errorMap) {
              setTokenError(errorMap.token);
            }

            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push('/');
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='password'
              placeholder='New password'
              label='New password'
              type='password'
            />
            {tokenError && (
              <Flex>
                <Box color='red'>{tokenError}</Box>
                <NextLink href='/forgot-password'>
                  <Link ml='auto'>Reset again?</Link>
                </NextLink>
              </Flex>
            )}
            <Button
              mt={4}
              type='submit'
              isLoading={isSubmitting}
              variantColor='teal'
            >
              Change password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
