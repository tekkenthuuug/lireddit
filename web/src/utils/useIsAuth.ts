import { useRouter } from 'next/router';
import { useMeQuery } from '../generated/graphql';
import { useEffect } from 'react';

export const useIsAuth = () => {
  const router = useRouter();
  const { data, loading } = useMeQuery();

  useEffect(() => {
    if (!loading && !data?.me) {
      router.push(`/login?next=${router.pathname}`);
    }
  }, [data, router, loading]);
};
