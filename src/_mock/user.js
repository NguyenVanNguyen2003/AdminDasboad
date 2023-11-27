import { faker } from '@faker-js/faker';
import { sample } from 'lodash';

// ----------------------------------------------------------------------

const users = [...Array(24)].map((_, index) => ({
  id: faker.datatype.uuid(),
  avatarUrl: `/assets/images/avatars/avatar_${index + 1}.jpg`,
  company: faker.company.name(),
  isVerified: faker.datatype.boolean(),
  status: sample(['Active', 'banned']),
  role: sample([
    'User',
    'Admin',
  ]),
}));

export default users;
