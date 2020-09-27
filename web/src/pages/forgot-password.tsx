import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withApollo } from '../utils/withApollo';
import React, { useState } from 'react';
import { InputField } from '../components/InputField';
import { Wrapper } from '../components/Wrapper';
import { useForgotPasswordMutation } from '../generated/graphql';

interface forgotPasswordProps {}

const ForgotPassword: React.FC<forgotPasswordProps> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [resetPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values, { setErrors }) => {
          await resetPassword({ variables: values });

          setComplete(true);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>If an account with this email exists we sent you an email</Box>
          ) : (
            <Form>
              <InputField name='email' placeholder='Email' label='Email' />
              <Button
                type='submit'
                isLoading={isSubmitting}
                variantColor='teal'
                mt={4}
              >
                Reset password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgotPassword);
