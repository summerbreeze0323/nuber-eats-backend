// Entity: db에 저장되는 데이터의 형태를 보여주는 모델
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// @InputType({isAbstract: true}) // isAbstract: true는 InputType을 schema에 적용시키는 것은 원하지 않을 때 사용
@ObjectType() // @ObjectType():자동으로 스키마를 빌드하기 위해 사용하는 GraphQL decorator
@Entity() // for TypeORM
export class Restaurant {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @Field(type => String)
  @Column()
  @IsString()
  @Length(5, 10) // min: 5, max: 10
  name: string;

  @Field(type => Boolean) // graphql playground DOCS에서 '!'값이 없다면 null 값을 허용하는 옵셔널(nullable) 값
  @Column()
  @IsBoolean()
  isVegan?: boolean;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  ownerName: string;

  @Field(type => String)
  @Column()
  @IsString()
  categoryName: string;
}