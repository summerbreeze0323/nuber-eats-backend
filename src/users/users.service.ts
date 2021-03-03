import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as jwt from 'jsonwebtoken';
import { CreateAccountInput } from "./dtos/create-account.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService
  ) {
    this.jwtService.hello()
   }

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
      await this.users.save(this.users.create({ email, password, role }));
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
      const user = await this.users.findOne({ email });
      if (!user) return { ok: false, error: '이메일에 해당하는 사용자를 찾을 수 없습니다.' };

      // 비밀번호가 맞는지 확인
      const passwordCorrent = await user.checkPassword(password);
      if (!passwordCorrent) return { ok: false, error: '잘못된 비밀번호입니다.' }

      const token = jwt.sign({ id: user.id }, this.config.get('PRIVATE_KEY'));

      return { ok: true, token };
    } catch (error) {
      return {
        ok: false,
        error
      }
    }
  }
}