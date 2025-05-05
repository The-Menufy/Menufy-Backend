const yup = require("yup");

const ingredientSchema = yup.object({
  libelle: yup.string().required("Libelle is required").trim(),
  quantity: yup.number().required("Quantity is required").min(0, "Quantity must be positive"),
  type: yup.string().required("Type is required").trim(),
  price: yup.number().required("Price is required").min(0, "Price must be positive"),
  disponibility: yup.boolean().default(true),
  maxQty: yup.number().required("Maximum quantity is required").min(0, "Maximum quantity must be positive"),
  minQty: yup.number().required("Minimum quantity is required").min(0, "Minimum quantity must be positive"),
  unit: yup.string().required("Unit is required").trim(),
});

module.exports = {
  ingredientSchema,
};