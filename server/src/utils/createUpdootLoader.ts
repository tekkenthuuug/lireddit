import DataLoader from 'dataloader';
import { Updoot } from '../entities/Updoot';

const createUpdootLoader = () => {
  return new DataLoader<{ postId: number; userId: number }, Updoot | null>(
    async keys => {
      const updoots = Updoot.findByIds(keys as any);
      const updootIdsToUpdoot: Record<string, Updoot> = {};
      (await updoots).forEach(updoot => {
        updootIdsToUpdoot[`${updoot.userId}|${updoot.postId}`] = updoot;
      });

      return keys.map(key => updootIdsToUpdoot[`${key.userId}|${key.postId}`]);
    }
  );
};

export default createUpdootLoader;
