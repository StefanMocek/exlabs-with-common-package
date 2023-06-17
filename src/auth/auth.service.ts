import {AuthUserDto} from './dtos/auth.user.dto';
import {AuthUserService, authUserService} from './auth-user/auth.user.service';
import {AuthenticationService} from '@exlabs-recruitment-task-sm-common/coomon/build';

export class AuthService {
  constructor(
    public authUserService: AuthUserService,
    public authenticationService: AuthenticationService
  ) { };

  async register(createAuthUserDto: AuthUserDto) {
    const existingAuthUser = await this.authUserService.findOneByEmail(createAuthUserDto.email);
    if (existingAuthUser) {
      return {message: 'Email already taken'};
    };
    const newAuthUser = await this.authUserService.create(createAuthUserDto);

    const jwt = this.authenticationService.generateJwt({email: createAuthUserDto.email, userId: newAuthUser._id}, process.env.JWT_KEY!);
    return {jwt};
  };

  async signin(signInDto: AuthUserDto) {
    const authUser = await this.authUserService.findOneByEmail(signInDto.email);
    if (!authUser) {
      return {message: 'Wrong credentials'};
    };

    const pwdCompered = this.authenticationService.passwordCompare(authUser.password, signInDto.password);

    if (!pwdCompered) {
      return {message: 'Wrong credentials'};
    };

    const jwt = this.authenticationService.generateJwt({email: authUser.email, userId: authUser._id}, process.env.JWT_KEY!);
    return {jwt};
  }
};

export const authService = new AuthService(authUserService, new AuthenticationService());