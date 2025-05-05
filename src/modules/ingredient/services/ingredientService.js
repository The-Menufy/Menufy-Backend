const Ingredient = require("../../../models/ingredient");
const {
	emitIngredientAlert,
	emitIngredientUpdate,
} = require("../sockets/socketIngredientService");
class IngredientService {
	async createIngredient(ingredientData) {
		const ingredient = new Ingredient(ingredientData);
		await ingredient.save();
		return ingredient;
	}
	async getAllIngredients() {
		return await Ingredient.find({});
	}
	async getIngredientById(id) {
		return await Ingredient.findById(id);
	}
	async updateIngredient(id, updateData) {
		const ingredient = await Ingredient.findByIdAndUpdate(
			id,
			{ $set: updateData },
			{ new: true }
		);
		emitIngredientUpdate(ingredient);
		// Check if quantity is at or below minQty and emit alert
		if (ingredient.quantity <= ingredient.minQty) {
			emitIngredientAlert(ingredient);
		}
		return ingredient;
	}
	async deleteIngredient(id) {
		const result = await Ingredient.findByIdAndDelete(id);
		return result;
	}
	async increaseQuantity(id, amount) {
		const ingredient = await Ingredient.findById(id);
		if (!ingredient) {
			throw new Error("Ingredient not found");
		}
		ingredient.quantity += amount;
		if (ingredient.quantity > ingredient.maxQty) {
			throw new Error(
				`Cannot exceed maximum quantity of ${ingredient.maxQty} ${ingredient.unit}`
			);
		}
		await ingredient.save();
		emitIngredientUpdate(ingredient);
		return ingredient;
	}
	async decreaseQuantity(id, amount) {
		const ingredient = await Ingredient.findById(id);
		if (!ingredient) {
			throw new Error("Ingredient not found");
		}
		ingredient.quantity -= amount;
		if (ingredient.quantity < 0) {
			throw new Error("Quantity cannot be negative");
		}
		await ingredient.save();
		// Check if quantity is at or below minQty and emit alert
		if (ingredient.quantity <= ingredient.minQty) {
			emitIngredientAlert(ingredient);
		}
		emitIngredientUpdate(ingredient);
		return ingredient;
	}
}
module.exports = new IngredientService();
