// Entity: db에 저장되는 데이터의 형태를 보여주는 모델
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Order } from "src/orders/entities/order.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { Category } from "./category.entity";
import { Dish } from "./dish.entity";

@InputType('RestaurantInputType', {isAbstract: true}) // isAbstract: true는 InputType을 schema에 적용시키는 것은 원하지 않을 때 사용
@ObjectType() // @ObjectType():자동으로 스키마를 빌드하기 위해 사용하는 GraphQL decorator
@Entity() // for TypeORM
export class Restaurant extends CoreEntity {
  @Field(type => String) // for graphql
  @Column() // for database
  @IsString() // 여기부터는 for validation
  @Length(5) // min: 5, max: 30
  name: string;

  // @Field(type => Boolean, { nullable: true }) // graphql playground DOCS에서 '!'값이 없다면 null 값을 허용하는 옵셔널(nullable) 값
  // @Column({ default: true })
  // @IsOptional()
  // @IsBoolean()
  // isVegan?: boolean;

  @Field(type => String)
  @Column()
  @IsString()
  address: string;

  @Field(type => String)
  @Column()
  @IsString()
  coverImg: string;

  @Field(type => Category, { nullable: true })
  @ManyToOne(
    type => Category,
    category => category.restaurants,
    { nullable: true, onDelete: 'SET NULL', eager: true }
  )
  category: Category;

  @Field(type => User)
  @ManyToOne(
    type => User,
    user => user.restaurants,
    { onDelete: 'CASCADE' },
  )
  owner: User;

  @RelationId((restaurant: Restaurant) => restaurant.owner)
  ownerId: number;

  @Field(type => [Order])
  @OneToMany(
    type => Order,
    order => order.restaurant,
  )
  orders: Order[];

  @Field(type => [Dish])
  @OneToMany(
    type => Dish,
    dish => dish.restaurant
  )
  menu: Dish[];

  @Field(type => Boolean)
  @Column({ default: false })
  isPromoted: boolean;

  @Field(type => Date, { nullable: true })
  @Column({ nullable: true })
  promotedUntil: Date;
}