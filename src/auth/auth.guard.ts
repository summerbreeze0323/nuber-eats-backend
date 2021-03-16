import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlExecutionContext } from "@nestjs/graphql";
import { User } from "src/users/entities/user.entity";
import { AllowedRoles } from './role.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

   // CanActivate: true를 return하면 request를 진해시키고, false면 request를 멈춤
  canActivate(context: ExecutionContext) {
    // resolver의 @Role(['xxx']) 가져오기
    const roles = this.reflector.get<AllowedRoles>('roles', context.getHandler());
    if (!roles) return true; // resolver의 @Role(['xxx'])이 정의되어있지 않은 경우, 즉 public

    // 유저 가져오기
    const gqlContext = GqlExecutionContext.create(context).getContext();
    console.log(gqlContext.token);
    const user: User = gqlContext['user']; 
    if (!user) return false; // 로그인 안했으면 false

    if (roles.includes('Any')) return true;

    return roles.includes(user.role);
  }
}