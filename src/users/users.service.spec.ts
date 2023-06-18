import { UserModelService } from "./user/user.model.service";
import { CreateUserDto, UpdateUserDto, DeleteUserDto } from "./dtos/user.dto";
import { UsersService } from "./users.service";
import {
  NotFoundError,
  BadRequestError,
} from "@exlabs-recruitment-task-sm-common/coomon/build";

describe("UsersService", () => {
  let usersService: UsersService;
  let userModelServiceMock: jest.Mocked<UserModelService>;

  beforeEach(() => {
    userModelServiceMock = {
      getAllUsers: jest.fn(),
      getOneById: jest.fn(),
      getOneByEmail: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;
    usersService = new UsersService(userModelServiceMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("getAll", () => {
    it("should call getAllUsers with role parameter if provided", async () => {
      const role = "user";
      userModelServiceMock.getAllUsers.mockResolvedValue([]);

      await usersService.getAll(role);

      expect(userModelServiceMock.getAllUsers).toHaveBeenCalledWith(role);
    });

    it("should call getAllUsers without role parameter if not provided", async () => {
      userModelServiceMock.getAllUsers.mockResolvedValue([]);

      await usersService.getAll();

      expect(userModelServiceMock.getAllUsers).toHaveBeenCalledWith(undefined);
    });
  });

  describe("getSingleUser", () => {
    it("should return user if found", async () => {
      const userId = "user-id";
      const user = {
        _id: userId,
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "user",
      };
      (userModelServiceMock.getOneById as jest.Mock).mockResolvedValue(user);

      const result = await usersService.getSingleUser(userId);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(user);
    });

    it("should return NotFoundError if user not found", async () => {
      const userId = "non-existent-user-id";
      userModelServiceMock.getOneById.mockResolvedValue(null);

      const result = await usersService.getSingleUser(userId);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(userId);
      expect(result).toBeInstanceOf(NotFoundError);
    });
  });

  describe("createUser", () => {
    it("should call create method with CreateUserDto", async () => {
      const createUserDto: CreateUserDto = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "user",
      };
      const createdUser = { ...createUserDto, _id: "created-user-id" };
      (userModelServiceMock.create as jest.Mock).mockResolvedValue(createdUser);
      (userModelServiceMock.getOneByEmail as jest.Mock).mockResolvedValue(
        undefined
      );

      const result = await usersService.createUser(createUserDto);

      expect(userModelServiceMock.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(createdUser);
    });
  });

  describe("updateUser", () => {
    it("should return BadRequestError if no properties are provided in UpdateUserDto", async () => {
      const updateUserDto: UpdateUserDto = {
        userId: "user-id",
      };
      (userModelServiceMock.getOneById as jest.Mock).mockResolvedValue({});
      const result = await usersService.updateUser(updateUserDto);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(
        updateUserDto.userId
      );
      expect(result).toBeInstanceOf(BadRequestError);
    });

    it("should return NotFoundError if user not found", async () => {
      const updateUserDto: UpdateUserDto = {
        userId: "non-existent-user-id",
        firstName: "John",
      };
      userModelServiceMock.getOneById.mockResolvedValue(null);

      const result = await usersService.updateUser(updateUserDto);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(
        updateUserDto.userId
      );
      expect(result).toBeInstanceOf(NotFoundError);
    });

    it("should call update method with UpdateUserDto", async () => {
      const updateUserDto: UpdateUserDto = {
        userId: "user-id",
        firstName: "John",
      };
      const updatedUser = { ...updateUserDto, _id: "updated-user-id" };
      (userModelServiceMock.getOneById as jest.Mock).mockResolvedValue(
        updatedUser
      );
      (userModelServiceMock.update as jest.Mock).mockResolvedValue(updatedUser);

      const result = await usersService.updateUser(updateUserDto);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(
        updateUserDto.userId
      );
      expect(userModelServiceMock.update).toHaveBeenCalledWith(updateUserDto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe("deleteUser", () => {
    it("should return NotFoundError if user not found", async () => {
      const deleteUserDto: DeleteUserDto = {
        userId: "non-existent-user-id",
      };
      userModelServiceMock.getOneById.mockResolvedValue(null);
      await usersService.deleteUser(deleteUserDto);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(
        deleteUserDto.userId
      );
    });

    it("should call delete method with DeleteUserDto", async () => {
      const deleteUserDto: DeleteUserDto = {
        userId: "user-id",
      };
      (userModelServiceMock.getOneById as jest.Mock).mockResolvedValue({});
      await usersService.deleteUser(deleteUserDto);

      expect(userModelServiceMock.getOneById).toHaveBeenCalledWith(
        deleteUserDto.userId
      );
      expect(userModelServiceMock.delete).toHaveBeenCalledWith(deleteUserDto);
    });
  });
});
