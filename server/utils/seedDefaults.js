import { fileURLToPath } from 'node:url';

import { connectDB, disconnectDB } from '../config/db.js';
import env from '../config/env.js';
import User from '../models/User.js';

export const seedDefaultUsers = async (logger = console) => {
  const defaults = [
    {
      name: env.defaultAdminName,
      email: env.defaultAdminEmail,
      password: env.defaultAdminPassword,
      role: 'admin',
    },
    {
      name: env.defaultTrainerName,
      email: env.defaultTrainerEmail,
      password: env.defaultTrainerPassword,
      role: 'trainer',
    },
  ];

  for (const userPayload of defaults) {
    if (!userPayload.email || !userPayload.password) {
      continue;
    }

    const existingUser = await User.findOne({ email: userPayload.email });

    if (!existingUser) {
      await User.create(userPayload);
      logger.info?.(`Seeded default ${userPayload.role}: ${userPayload.email}`);
    }
  }
};

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  try {
    await connectDB();
    await seedDefaultUsers(console);
    await disconnectDB();
    console.info('Default users seeded successfully.');
  } catch (error) {
    console.error('Failed to seed default users.', error);
    process.exitCode = 1;
  }
}
