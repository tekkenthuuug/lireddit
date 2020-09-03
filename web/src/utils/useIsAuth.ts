import { useRouter } from 'next/router';
import { useMeQuery, useCreatePostMutation } from '../generated/graphql';
import { useEffect } from 'react';

export const useIsAuth = () => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery();
  const [, createPost] = useCreatePostMutation();

  useEffect(() => {
    if (!fetching && !data?.me) {
      router.push(`/login?next=${router.pathname}`);
    }
  }, [data, router, fetching]);
};
