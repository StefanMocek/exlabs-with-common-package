import { AuthenticationService } from "@exlabs-recruitment-task-sm-common/coomon/build";
import { AuthUserService } from "./auth-user/auth.user.service";
import { AuthService } from "./auth.service";
import { AuthUserDto } from "./dtos/auth.user.dto";

describe("AuthService", () => {
  let authService: AuthService;
  let authUserService: AuthUserService;
  let authenticationService: AuthenticationService;

  beforeEach(() => {
    // Mock the dependencies
    authUserService = {
      create: jest.fn(),
      findOneByEmail: jest.fn(),
    } as any;

    authenticationService = {
      generateJwt: jest.fn(),
      passwordCompare: jest.fn(),
    } as any;

    authService = new AuthService(authUserService, authenticationService);
  });

  it("should register a new user and generate a JWT", async () => {
    const createAuthUserDto: AuthUserDto = {
      email: "test@example.com",
      password: "password123",
    };

    const existingAuthUser = null;
    const newAuthUser = { _id: "123", email: createAuthUserDto.email };
    const jwtToken = "generated-jwt-token";

    // Mock the dependencies' methods
    (authUserService.findOneByEmail as jest.Mock).mockResolvedValue(
      existingAuthUser
    );
    (authUserService.create as jest.Mock).mockResolvedValue(newAuthUser);
    (authenticationService.generateJwt as jest.Mock).mockReturnValue(jwtToken);

    const result = await authService.register(createAuthUserDto);

    expect(authUserService.findOneByEmail).toHaveBeenCalledWith(
      createAuthUserDto.email
    );
    expect(authUserService.create).toHaveBeenCalledWith(createAuthUserDto);
    expect(authenticationService.generateJwt).toHaveBeenCalledWith(
      { email: createAuthUserDto.email, userId: newAuthUser._id },
      process.env.JWT_KEY!
    );
    expect(result).toEqual({ jwt: jwtToken });
  });

  it("should return an error message if email already exists during registration", async () => {
    const createAuthUserDto: AuthUserDto = {
      email: "test@example.com",
      password: "password123",
    };

    const existingAuthUser = { _id: "123", email: createAuthUserDto.email };

    // Mock the dependencies' methods
    (authUserService.findOneByEmail as jest.Mock).mockResolvedValue(
      existingAuthUser
    );

    const result = await authService.register(createAuthUserDto);

    expect(authUserService.findOneByEmail).toHaveBeenCalledWith(
      createAuthUserDto.email
    );
    expect(authUserService.create).not.toHaveBeenCalled();
    expect(authenticationService.generateJwt).not.toHaveBeenCalled();
    expect(result).toEqual({ message: "Email already taken" });
  });

  it("should sign in a user and generate a JWT", async () => {
    const signInDto: AuthUserDto = {
      email: "test@example.com",
      password: "password123",
    };

    const authUser = {
      _id: "123",
      email: signInDto.email,
      password: "wrong pwd",
    };
    const jwtToken = "generated-jwt-token";

    // Mock the dependencies' methods
    (authUserService.findOneByEmail as jest.Mock).mockResolvedValue(authUser);
    (authenticationService.passwordCompare as jest.Mock).mockReturnValue(true);
    (authenticationService.generateJwt as jest.Mock).mockReturnValue(jwtToken);

    const result = await authService.signin(signInDto);

    expect(authUserService.findOneByEmail).toHaveBeenCalledWith(
      signInDto.email
    );
    expect(authenticationService.passwordCompare).toHaveBeenCalledWith(
      authUser.password,
      signInDto.password
    );
    expect(authenticationService.generateJwt).toHaveBeenCalledWith(
      { email: authUser.email, userId: authUser._id },
      process.env.JWT_KEY!
    );
    expect(result).toEqual({ jwt: jwtToken });
  });

  it("should return an error message if user does not exist during sign in", async () => {
    const signInDto: AuthUserDto = {
      email: "test@example.com",
      password: "password123",
    };

    const authUser = null;

    // Mock the dependencies' methods
    (authUserService.findOneByEmail as jest.Mock).mockResolvedValue(authUser);

    const result = await authService.signin(signInDto);

    expect(authUserService.findOneByEmail).toHaveBeenCalledWith(
      signInDto.email
    );
    expect(authenticationService.passwordCompare).not.toHaveBeenCalled();
    expect(authenticationService.generateJwt).not.toHaveBeenCalled();
    expect(result).toEqual({ message: "Wrong credentials" });
  });

  it("should return an error message if password is incorrect during sign in", async () => {
    const signInDto: AuthUserDto = {
      email: "test@example.com",
      password: "password123",
    };

    const authUser = {
      _id: "123",
      email: signInDto.email,
      password: "wrong pwd",
    };

    // Mock the dependencies' methods
    (authUserService.findOneByEmail as jest.Mock).mockResolvedValue(authUser);
    (authenticationService.passwordCompare as jest.Mock).mockReturnValue(false);

    const result = await authService.signin(signInDto);

    expect(authUserService.findOneByEmail).toHaveBeenCalledWith(
      signInDto.email
    );
    expect(authenticationService.passwordCompare).toHaveBeenCalledWith(
      authUser.password,
      signInDto.password
    );
    expect(authenticationService.generateJwt).not.toHaveBeenCalled();
    expect(result).toEqual({ message: "Wrong credentials" });
  });
});
