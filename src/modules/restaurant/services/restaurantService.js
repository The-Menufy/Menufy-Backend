const Restaurant = require("../../../models/restaurant");

class RestaurantService {
  async createRestaurant(restaurantData) {
    const restaurant = new Restaurant(restaurantData);
    await restaurant.save();
    return restaurant;
  }

  async getAllRestaurants() {
    const restaurants = await Restaurant.find();
    return restaurants;
  }

  async getRestaurantById(id) {
    const restaurant = await Restaurant.findById(id);
    return restaurant;
  }

  async updateRestaurant(id, updateData) {
    const restaurant = await Restaurant.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    return restaurant;
  }

  async deleteRestaurant(id) {
    const result = await Restaurant.findByIdAndDelete(id);
    return result;
  }
}

module.exports = new RestaurantService();
