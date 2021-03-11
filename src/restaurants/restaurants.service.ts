import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // db 접근
    private readonly restaurants: Repository<Restaurant>
  ) { }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant.'
      }
    }
  }
}