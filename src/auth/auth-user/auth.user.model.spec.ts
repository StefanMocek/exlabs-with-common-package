import { AuthUser} from "./auth.user.model";

describe("AuthUser Model", () => {
  
    it("should create a new user", async () => {
      const email = "john.doe@example.com";
      const password = "password";
  
      const authUser = await AuthUser.create({
        email,
        password,
      });
  
      expect(authUser._id).toBeDefined();
      expect(authUser.email).toBe(email);
    });
  
    it("should find a user by ID", async () => {
      const email = "john.doe@example.com";
      const password = "password";
  
      const createdUser = await AuthUser.create({
        email,
        password,
      });
  
      const foundUser = await AuthUser.findById(createdUser._id);
  
      expect(foundUser).toBeDefined();
      expect(foundUser!.email).toBe(email);
    });
  
    it("should find all users", async () => {
      const usersToCreate = [
        {
          email: "user1@example.com",
          password: "password1",
        },
        {
          email: "user2@example.com",
          password: "password2",
        },
        {
          email: "user3@example.com",
          password: "password3",
        },
      ];
  
      await AuthUser.create(usersToCreate);
  
      const foundUsers = await AuthUser.find();
  
      expect(foundUsers.length).toBe(usersToCreate.length);
    });
  
    it("should delete a user by ID", async () => {
      const email = "john.doe@example.com";
      const password = "password";
  
      const createdUser = await AuthUser.create({
        email,
        password,
      });
  
      const deletedUser = await AuthUser.findByIdAndDelete(createdUser._id);
  
      expect(deletedUser).toBeDefined();
      expect(deletedUser!.email).toBe(email);
  
      const foundUser = await AuthUser.findById(createdUser._id);
      expect(foundUser).toBeNull();
    });
  });