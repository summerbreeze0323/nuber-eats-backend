import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Verification } from "./entities/verification.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification) private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService
  ) {}

  async createAccount({email, password, role}: CreateAccountInput): Promise<{ok:boolean, error?:string}> {
    // check new user
    try {
      const exists = await this.users.findOne({ email });
      if (exists) {
        return {
          ok: false,
          error: '해당 이메일을 가진 사용자가 이미 존재합니다.'
        };
      }
      // create user
      const user = await this.users.save(this.users.create({ email, password, role }));
      await this.verifications.save(this.verifications.create({
        user
      }))
      return {ok: true};
    } catch (e) {
      return {
        ok: false,
        error: '계정을 생성할 수 없습니다.'
      };
    }
  }

  async login({ email, password }: LoginInput): Promise<{ ok: boolean, error?: string, token?: string }> {
    // jwt 만들고 user에게 주기
    try {
      // 이메일에 해당하는 유저 찾기
      const user = await this.users.findOne({ email }, { select: ['id','password'] });
      if (!user) return { ok: false, error: '이메일에 해당하는 사용자를 찾을 수 없습니다.' };

      // 비밀번호가 맞는지 확인
      const passwordCorrent = await user.checkPassword(password);
      if (!passwordCorrent) return { ok: false, error: '잘못된 비밀번호입니다.' }

      const token = this.jwtService.sign(user.id);

      return { ok: true, token };
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }

  async findById(id:number): Promise<User> {
    return this.users.findOne({ id });
  }

  async editProfile(userId: number, {email, password}: EditProfileInput): Promise<User> {
    const user = await this.users.findOne(userId);
    if (email) {
      user.email = email;
      user.verified = false;
      await this.verifications.save(this.verifications.create({ user }));
    }
    if (password) {
      user.password = password;
    }
    return this.users.save(user);
  }

  async verifyEmail(code: string): Promise<boolean> {
    try {
      const verification = await this.verifications.findOne(
        { code },
        // { loadRelationIds: true }
        { relations: ['user']}
      );
      if (verification) {
        verification.user.verified = true;
        this.users.save(verification.user);
        return true;
      }
      throw new Error();
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}