import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantsModule } from './restaurants/restaurants.module';

@Module({
  imports: [
    ConfigModule.forRoot({ // .env 사용을 위해
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.dev' : '.env.test'
    }),
    TypeOrmModule.forRoot({
      'type': 'postgres',
      'host': 'localhost',
      'port': 5432,
      'username': 'julee',
      'password': 'test', // 'host': 'localhost'로 되어있다면 패스워드를 묻지 않음
      'database': 'nuber-eats',
      'synchronize': true, // TypeORM이 db에 연결할 때 db를 나의 모듈의 현재 상태로 마이그래이션 한다는 뜻
      'logging': true, // db에서 무슨일이 일어나는지 콘솔로 표시
    }),
    GraphQLModule.forRoot({
      autoSchemaFile: true,
    }),
    RestaurantsModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
