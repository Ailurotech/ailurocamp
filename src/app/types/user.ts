export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentRole: UserRole;
}

export type UserRole = 'admin' | 'instructor' | 'student';

export interface UpdateUserRolesRequest {
  userId: string;
  roles: UserRole[];
}

export interface UsersResponse {
  users: User[];
}
