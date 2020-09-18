import React from 'react';
import { Box, Link, Flex, Button, Heading } from '@chakra-ui/core';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';
import { isServer } from '../utils/isSever';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer(),
  });

  let body = null;

  // loading
  if (fetching) {
    // not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2}>Login</Link>
        </NextLink>
        <NextLink href='/register'>
          <Link>Register</Link>
        </NextLink>
      </>
    );
    // logged in
  } else {
    body = (
      <Flex alignItems='center'>
        <NextLink href='/create-post'>
          <Button as={Link} mr={4}>
            Create post
          </Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => logout()}
          isLoading={logoutFetching}
          variant='link'
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg='tan' p={4} position='sticky' top={0} zIndex={100}>
      <Flex maxWidth={800} alignItems='center' flex={1} mx='auto'>
        <NextLink href='/'>
          <Link>
            <Heading>LiReddit</Heading>
          </Link>
        </NextLink>

        <Box ml='auto'>{body}</Box>
      </Flex>
    </Flex>
  );
};
