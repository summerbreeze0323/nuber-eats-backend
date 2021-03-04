import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import * as Joi from 'joi'; // 자바스크립트로 만들어진 모듈이기 때문에 이렇게 import
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql'; // GraphQL decorators are for the GraphQL Schema.
import { TypeOrmModule } from '@nestjs/typeorm'; // TypeORM decorators are for the DB.
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { JwtMiddleware } from './jwt/jwt.middleware';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // .env 사용을 위해
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test',
      // ignoreEnvFile: 서버에 deploy 할 떄 환경변수 파일을 사용하지 않는다는 옵션
      // production 환경일 때는 ConfigModule이 환경변수 파일을 무시하게 됨
      ignoreEnvFile: process.env.NODE_ENV === 'prod',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
        PRIVATE_KEY: Joi.string().required(),
        MAILGUN_API_KEY: Joi.string().required(),
        MAILGUN_DOMAIN_NAME: Joi.string().required(),
        MAILGUN_FROM_EMAIL: Joi.string().required()
      })
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD, // 'host': 'localhost'로 되어있다면 패스워드를 묻지 않음
      database: process.env.DB_DATABASE,
      synchronize: process.env.NODE_ENV !== 'prod', // TypeORM이 db에 연결할 때 db를 나의 모듈의 현재 상태로 마이그래이션 한다는 뜻
      logging: true, // db에서 무슨일이 일어나는지 콘솔로 표시
      entities: [User, Verification]
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
      context: ({req}) => ({user: req['user']})
    }),
    JwtModule.forRoot({
      privateKey: process.env.PRIVATE_KEY
    }),
    UsersModule,
    MailModule.forRoot({
      apiKey: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN_NAME,
      fromEmail: process.env.MAILGUN_FROM_EMAIL
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(JwtMiddleware).forRoutes({
      path: '/graphql',
      method: RequestMethod.POST
    })
  }
}
