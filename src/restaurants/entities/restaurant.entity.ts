// Entity: db에 저장되는 데이터의 형태를 보여주는 모델
import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType() // @ObjectType():자동으로 스키마를 빌드하기 위해 사용하는 GraphQL decorator
@Entity() // for TypeORM
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String)
  @Column()
  name: string;

  @Field(type => Boolean) // graphql playground DOCS에서 '!'값이 없다면 null 값을 허용하는 옵셔널(nullable) 값
  @Column()
  isVegan?: boolean;

  @Field(type => String)
  @Column()
  address: string;

  @Field(type => String)
  @Column()
  ownerName: string;

  @Field(type => String)
  @Column()
  categoryName: string;
}