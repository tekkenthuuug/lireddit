import { Resolver } from '@urql/exchange-graphcache';
import { stringifyVariables } from 'urql';

const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`;

    const isInTheCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      'posts'
    );

    info.partial = !isInTheCache;

    const results: string[] = [];

    let hasMore = true;

    fieldInfos.forEach(fi => {
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const data = cache.resolve(key, 'posts') as string[];
      hasMore = !!cache.resolve(key, 'hasMore');

      results.push(...data);
    });

    return { posts: results, hasMore, __typename: 'PaginatedPosts' };
  };
};

export default cursorPagination;
