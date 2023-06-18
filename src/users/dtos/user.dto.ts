export interface CreateUserDto {
  firstName?: string;
  lastName?: string;
  email: string;
  role: string;
}

export interface UpdateUserDto {
  userId: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface DeleteUserDto {
  userId: string;
}
