const { getIO } = require("../../../config/socket");

const emitIngredientAlert = (ingredient) => {
	const io = getIO();
	io.emit("ingredient-alert", {
		message: `Low stock alert: ${ingredient.libelle} is running low! Current quantity: ${ingredient.quantity} ${ingredient.unit}`,
		ingredient: ingredient,
	});
};

const emitIngredientUpdate = (ingredient) => {
	const io = getIO();
	io.emit("ingredient-update", {
		message: `Ingredient ${ingredient.libelle} has been updated`,
		ingredient: ingredient,
	});
};

module.exports = {
	emitIngredientAlert,
	emitIngredientUpdate,
};
