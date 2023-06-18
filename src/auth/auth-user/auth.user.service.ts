import { AuthUser, AuthUserDoc, AuthUserModel } from "./auth.user.model";
import { AuthUserDto } from "../dtos/auth.user.dto";

export class AuthUserService {
  constructor(public userModel: AuthUserModel) {}

  async create(createUserDto: AuthUserDto): Promise<AuthUserDoc> {
    const user = new this.userModel({
      email: createUserDto.email,
      password: createUserDto.password,
    });

    return await user.save();
  }

  async findOneByEmail(email: string): Promise<AuthUserDoc | null> {
    return await this.userModel.findOne({ email });
  }
}

export const authUserService = new AuthUserService(AuthUser);
