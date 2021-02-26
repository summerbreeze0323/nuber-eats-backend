import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class Restaurant {
  @Field(type => String)
  name: string;

  @Field(type => Boolean) // graphql playground DOCS에서 '!'값이 없다면 null 값을 허용하는 옵셔널(nullable) 값
  isVegan?: boolean;

  @Field(type => String)
  address: string;

  @Field(type => String)
  ownerName: string;
}