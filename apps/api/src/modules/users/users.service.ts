import { AppError } from '../../errors/app-error.js';
import { ErrorCode } from '../../errors/error-codes.js';
import { usersRepository } from './users.repository.js';
export const usersService = {
  async setupUsername(userId: string, username: string) {
    try {
      const result = await usersRepository.setupUsername(
        userId,
        username.trim(),
        username.trim().toLowerCase(),
      );
      if (!result.count)
        throw new AppError(409, ErrorCode.USERNAME_ALREADY_SET, 'Username has already been set');
      return { username: username.trim() };
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002')
        throw new AppError(409, ErrorCode.USERNAME_TAKEN, 'That username is unavailable');
      throw error;
    }
  },
  async lookup(userId: string, username: string) {
    const user = await usersRepository.findActiveVerifiedByUsername(
      username.trim().toLowerCase(),
      userId,
    );
    return {
      user: user
        ? { username: user.username!, displayName: user.displayName, avatarUrl: user.avatarUrl }
        : null,
    };
  },
};
