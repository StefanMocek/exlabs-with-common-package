import { AuthUserService } from "./auth.user.service";
import { AuthUser } from "./auth.user.model";
import { AuthUserDto } from "../dtos/auth.user.dto";

describe("AuthUserService", () => {
  let authUserService: AuthUserService;

  beforeEach(() => {
    authUserService = new AuthUserService(AuthUser);
  });

  it("should create a new user", async () => {
    const createUserDto: AuthUserDto = {
      email: "john.doe@example.com",
      password: "password",
    };

    const createdUser = await authUserService.create(createUserDto);

    expect(createdUser._id).toBeDefined();
    expect(createdUser.email).toBe(createUserDto.email);
  });

  it("should find a user by email", async () => {
    const createUserDto: AuthUserDto = {
      email: "john.doe@example.com",
      password: "password",
    };

    await authUserService.create(createUserDto);

    const foundUser = await authUserService.findOneByEmail(createUserDto.email);

    expect(foundUser).toBeDefined();
    expect(foundUser!.email).toBe(createUserDto.email);
  });
});
