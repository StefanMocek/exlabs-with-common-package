import { CreateUserDto } from "../dtos/user.dto";
import { User } from "./user.model";

describe("User Model", () => {
  it("should create a user successfully", async () => {
    const createUser: CreateUserDto = {
      firstName: "first",
      lastName: "last",
      email: "email",
      role: "user",
    };

    const newUser = await User.create(createUser);

    expect(newUser._id).toBeDefined();
    expect(newUser.firstName).toBe(createUser.firstName);
    expect(newUser.lastName).toBe(createUser.lastName);
    expect(newUser.email).toBe(createUser.email);
    expect(newUser.role).toBe(createUser.role);
  });

  it("should retrieve a user by _id", async () => {
    const createUser: CreateUserDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
    };

    const newUser = await User.create(createUser);

    const retrievedUser = await User.findOne({ _id: newUser._id });

    expect(retrievedUser).toBeDefined();
    expect(retrievedUser?.firstName).toBe(createUser.firstName);
    expect(retrievedUser?.lastName).toBe(createUser.lastName);
    expect(retrievedUser?.email).toBe(createUser.email);
    expect(retrievedUser?.role).toBe(createUser.role);
  });

  it("should update a user", async () => {
    const createUser: CreateUserDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
    };

    const newUser = await User.create(createUser);

    const updateData = {
      firstName: "Jane",
      lastName: "Smith",
    };

    await User.findByIdAndUpdate(newUser._id, updateData);

    const updatedUser = await User.findById(newUser._id);

    expect(updatedUser).toBeDefined();
    expect(updatedUser?.firstName).toBe(updateData.firstName);
    expect(updatedUser?.lastName).toBe(updateData.lastName);
    expect(updatedUser?.email).toBe(createUser.email);
    expect(updatedUser?.role).toBe(createUser.role);
  });

  it("should delete a user", async () => {
    const createUser: CreateUserDto = {
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      role: "user",
    };

    const newUser = await User.create(createUser);

    await User.findByIdAndDelete(newUser._id);

    const deletedUser = await User.findById(newUser._id);

    expect(deletedUser).toBeNull();
  });
});
