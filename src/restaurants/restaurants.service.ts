import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Like, Repository, TreeRepository } from "typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { CategoryRepository } from "./repositories/category.repository";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "./dtos/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantOutput, SearchRestaurantInput } from "./dtos/search-restaurant.dto";

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant) // db 접근
    private readonly restaurants: Repository<Restaurant>,
    private readonly categories: CategoryRepository
  ) { }

  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurants.create(createRestaurantInput);
      newRestaurant.owner = owner;
      const category = await this.categories.getOrCreate(createRestaurantInput.categoryName)
      newRestaurant.category = category;

      await this.restaurants.save(newRestaurant);
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not create restaurant.'
      }
    }
  }

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput
  ): Promise<EditRestaurantOutput> {
    try {
      // const restaurant = await this.restaurants.findOne(
      //   editRestaurantInput.restaurantId
      // );
    
      // if (!restaurant) return { ok: false, error: 'Restaurant not found.' };

      // if (owner.id !== restaurant.ownerId) {
      //   return { ok: false, error: 'You can\'t edit restaurant that you don\'t owner.' };
      // }

      let category: Category = null;
      if (editRestaurantInput.categoryName) {
        category = await this.categories.getOrCreate(editRestaurantInput.categoryName);
      };

      await this.restaurants.save([{
        id: editRestaurantInput.restaurantId,
        ...editRestaurantInput,
        ...(category && ({category}))
      }]);
      
      return { ok: true }
    } catch (error) {
      return { ok: false, error: 'Could not edit restaurant.' };
    }
  }

  async deleteRestaurant(
    owner: User,
    {restaurantId}: DeleteRestaurantInput
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
    
      if (!restaurant) return { ok: false, error: 'Restaurant not found.' };

      if (owner.id !== restaurant.ownerId) {
        return { ok: false, error: 'You can\'t edit restaurant that you don\'t owner.' };
      }

      await this.restaurants.delete(restaurantId);
    } catch (error) {
      return { ok: false, error: 'Could not delete restaurant.' };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categories.find();
      return {
        ok: true,
        categories
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load categories.'
      }
    }
  }

  countRestaurant(category: Category) {
    return this.restaurants.count({ category });
  }

  async findCategoryBySlug({ slug, page }: CategoryInput): Promise<CategoryOutput> {
    try {
      const category = await this.categories.findOne({ slug });
      if (!category) {
        return {
          ok: false,
          error: 'Caegory not found'  
        }
      }
      const restaurants = await this.restaurants.find({
        where: { category },
        take: 25,
        skip: (page - 1) * 25
      });
      const totalResults = await this.countRestaurant(category);
      
      return {
        ok: true,
        restaurants,
        category,
        totalPages: Math.ceil(totalResults / 25)
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load category.'
      }
    }
  }

  async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        skip: (page - 1) * 25,
        take: 25
      });
      return {
        ok: true,
        results: restaurants,
        totalPages: Math.ceil(totalResults / 25),
        totalResults
      }
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurants.'
      }
    }
  }

  async FindRestaurantById({ restaurantId }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurants.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: 'Restaurant not found'
        };
      }
      console.log(restaurant)
      return { ok: true, restaurant };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not load restaurant.'
      }
    }
  }

  async searchRestaurantByName({ query, page }: SearchRestaurantInput): Promise<SearchRestaurantOutput> {
    try {
      const [restaurants, totalResults] = await this.restaurants.findAndCount({
        where: {
          name: Like(`%${query}%`)
        }
      });
      return { ok: true, restaurants };
    } catch (error) {
      return {
        ok: false,
        error: 'Could not search for restaurants.'
      }
    }
  }
}