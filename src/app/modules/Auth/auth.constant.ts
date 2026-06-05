export const USER_ROLE = {
  superAdmin: 'superAdmin',
  admin: 'admin',
  member: 'member',
  guest: 'guest',
} as const;

export type TUserRole = keyof typeof USER_ROLE;
export const UserStatus = ['active', 'blocked'];