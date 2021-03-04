import { Field, ObjectType } from "@nestjs/graphql";
import { CreateDateColumn, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
export class CoreEntity {
  @PrimaryGeneratedColumn()
  @Field(type => Number)
  id: number;

  @CreateDateColumn() // 자동으로 설정해주는 column
  @Field(type => Date)
  createdAt: Date;

  @CreateDateColumn()
  @Field(type => Date)
  updatedAt: Date;
}