import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";

@Resolver(of => Restaurant)
export class RestaurantResolver {
  @Query(returns => [Restaurant]) // [Restaurant]: GraphQL 방식
  restaurants(@Args('veganOnly') veganOnly: boolean): Restaurant[] { // Restaurant[]: 타입스크립트 방식
    return [];
  }

  @Mutation(returns => Boolean)
  createRestaurant(
    @Args() CreateRestaurantDto: CreateRestaurantDto
  ): boolean {
    console.log(CreateRestaurantDto)
    return true;
  }
}
