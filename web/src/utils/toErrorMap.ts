import { Failure } from '../generated/graphql';

export const toErrorMap = (errors: Failure[]) => {
  const errorMap: Record<string, string> = {};

  errors.forEach(({ field, message }) => {
    errorMap[field] = message;
  });

  return errorMap;
};
