import DataLoader from 'dataloader';
import { User } from '../entities/User';
import sortLoaderReturn from './sortLoaderReturn';

const createUserLoader = () => {
  return new DataLoader<number, User>(async userIds => {
    const users = await User.findByIds(userIds as number[]);

    // return User[] should match the order of userIds
    return sortLoaderReturn(userIds as number[], users);
  });
};

export default createUserLoader;
