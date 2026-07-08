import type { IUser, UserFormValues } from './types';

export function toUserFormValues(user?: IUser): UserFormValues {
  return {
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    telegramNickName: user?.telegramNickName ?? '',
  };
}
