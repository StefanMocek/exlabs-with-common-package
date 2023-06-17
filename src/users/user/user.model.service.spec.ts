import { CreateUserDto, DeleteUserDto, UpdateUserDto } from "../dtos/user.dto";
import { User, UserDoc } from "./user.model";
import { UserModelService } from "./user.model.service";

describe("UserModelService", () => {
    let userModelService: UserModelService;
  
    beforeEach(() => {
      userModelService = new UserModelService(User);
    });
  
    it("should get a user by ID", async () => {
      const userId = "1";
      const user = { _id: userId, firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: "user" };
      jest.spyOn(User, "findOne").mockResolvedValueOnce(user as UserDoc);
  
      const result = await userModelService.getOneById(userId);
  
      expect(result).toEqual(user);
      expect(User.findOne).toHaveBeenCalledWith({ _id: userId });
    });
  
    it("should get all users", async () => {
      const users = [
        { _id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: "user" },
        { _id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", role: "admin" },
      ];
      jest.spyOn(User, "find").mockResolvedValueOnce(users as UserDoc[]);
  
      const result = await userModelService.getAllUsers();
  
      expect(result).toEqual(users);
      expect(User.find).toHaveBeenCalledWith({});
    });
  
    it("should get users by role", async () => {
      const roleQuery = "user";
      const users = [
        { _id: "1", firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: "user" },
        { _id: "2", firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", role: "user" },
      ];
      jest.spyOn(User, "find").mockResolvedValueOnce(users as UserDoc[]);
  
      const result = await userModelService.getAllUsers(roleQuery);
  
      expect(result).toEqual(users);
      expect(User.find).toHaveBeenCalledWith({ role: roleQuery });
    });
  
    it("should create a new user", async () => {
      const createUserDto: CreateUserDto = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        role: "user",
      };
      const newUser = { _id: "1", ...createUserDto };
      jest.spyOn(User.prototype, "save").mockResolvedValueOnce(newUser as UserDoc);
  
      const result = await userModelService.create(createUserDto);
  
      expect(result).toEqual(newUser);
      expect(User.prototype.save).toHaveBeenCalled();
    });
  
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = {
        userId: "1",
        firstName: "Jane",
      };
      const updatedUser = { _id: updateUserDto.userId, firstName: updateUserDto.firstName, lastName: "Doe", email: "john.doe@example.com", role: "user" };
      jest.spyOn(User, "findOneAndUpdate").mockResolvedValueOnce(updatedUser as UserDoc);
  
      const result = await userModelService.update(updateUserDto);
  
      expect(result).toEqual(updatedUser);
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: updateUserDto.userId },
        { $set: { firstName: updateUserDto.firstName } },
        { new: true }
      );
    });
  
    it("should delete a user", async () => {
      const deleteUserDto: DeleteUserDto = {
        userId: "1",
      };
      const deletedUser = { _id: deleteUserDto.userId, firstName: "John", lastName: "Doe", email: "john.doe@example.com", role: "user" };
      jest.spyOn(User, "findOneAndRemove").mockResolvedValueOnce(deletedUser as UserDoc);
  
      const result = await userModelService.delete(deleteUserDto);
  
      expect(result).toEqual(deletedUser);
      expect(User.findOneAndRemove).toHaveBeenCalledWith({ _id: deleteUserDto.userId });
    });
  });