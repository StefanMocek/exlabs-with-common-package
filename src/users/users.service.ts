import {UserModelService, userModelService} from "./user/user.model.service";
import {CreateUserDto, UpdateUserDto, DeleteUserDto} from './dtos/user.dto';
import {BadRequestError, NotFoundError} from '@exlabs-recruitment-task-sm-common/coomon/build';
import {UserDoc} from "./user/user.model";

export class UsersService {
  constructor(
    public userModelService: UserModelService
  ) { };

  getAll(role?: string): Promise<UserDoc[] | null> {
    return this.userModelService.getAllUsers(role);
  };

  async getSingleUser(userId: string): Promise<UserDoc | NotFoundError> {
    const user = await this.userModelService.getOneById(userId);
    if (!user) {
      return new NotFoundError();
    }
    return user;
  };

  async createUser(createUserDto: CreateUserDto): Promise<UserDoc | BadRequestError> {
    const user = await this.userModelService.getOneByEmail(createUserDto.email);
    if (user) {
      return new BadRequestError('Email already in use');
    };

    return this.userModelService.create(createUserDto);
  };

  async updateUser(updateUserDto: UpdateUserDto): Promise<UserDoc | NotFoundError | BadRequestError | null> {
    const user = await this.userModelService.getOneById(updateUserDto.userId);
    if (!user) {
      return new NotFoundError();
    };

    if (!updateUserDto.firstName && !updateUserDto.lastName && !updateUserDto.role) {
      return new BadRequestError('You should provide at least one property');
    };

    return this.userModelService.update(updateUserDto);
  };

  async deleteUser(deleteUserDto: DeleteUserDto): Promise<UserDoc | NotFoundError | null> {
    const user = await this.userModelService.getOneById(deleteUserDto.userId);
    if (!user) {
      return new NotFoundError();
    };

    return this.userModelService.delete(deleteUserDto);
  };
};

export const usersService = new UsersService(userModelService);

