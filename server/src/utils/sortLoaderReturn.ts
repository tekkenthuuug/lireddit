function sortLoaderReturn<V extends { id: number }>(
  ids: (number | string)[],
  objectsWithIds: V[]
) {
  const objectIdToUser: Record<number | string, V> = {};

  objectsWithIds.forEach(object => {
    objectIdToUser[object.id] = object;
  });

  return ids.map(id => objectIdToUser[id]);
}

export default sortLoaderReturn;
