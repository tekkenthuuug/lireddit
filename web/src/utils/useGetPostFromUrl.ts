import { useRouter } from 'next/router';
import { usePostQuery } from '../generated/graphql';

const useGetPostFromUrl = () => {
  const router = useRouter();
  const intId =
    typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;
  const [postQueryData] = usePostQuery({
    pause: intId === -1,
    variables: {
      id: intId,
    },
  });

  return [postQueryData, intId] as const;
};

export default useGetPostFromUrl;
