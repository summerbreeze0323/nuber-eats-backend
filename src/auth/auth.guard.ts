import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "src/jwt/jwt.service";
import { User } from "src/users/entities/user.entity";
import { UsersService } from "src/users/users.service";
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly UsersService: UsersService
  ) { }

   // CanActivate: true를 return하면 request를 진해시키고, false면 request를 멈춤
  async canActivate(context: ExecutionContext) {
    // resolver의 @Role(['xxx']) 가져오기
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());
    if (!roles) return true; // resolver의 @Role(['xxx'])이 정의되어있지 않은 경우, 즉 public

    // 유저 가져오기
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      const decoded = this.jwtService.verify(token.toString());
      if (typeof decoded === 'object' && decoded.hasOwnProperty('id')) {
        const { user } = await this.UsersService.findById(decoded['id']);
        if (user) {
          gqlContext['user'] = user;
          if (roles.includes('Any')) return true;
          return roles.includes(user.role);
        }
      }
    }

    return false;
  }
}