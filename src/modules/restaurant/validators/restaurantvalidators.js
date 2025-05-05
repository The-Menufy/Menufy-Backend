const yup = require("yup");

const restaurantSchema = yup.object({
  nameRes: yup.string().trim().required("Le nom du restaurant est requis"),
  address: yup.string().trim().required("L'adresse est requise"),
  cuisineType: yup.string().trim().required("Le type de cuisine est requis"),
  taxeTPS: yup
    .number()
    .required("La taxe TPS est requise")
    .min(0, "La taxe TPS doit être positive"),
  taxeTVQ: yup
    .number()
    .required("La taxe TVQ est requise")
    .min(0, "La taxe TVQ doit être positive"),
  color: yup.string().trim().optional(),
  logo: yup.string().url("Le logo doit être une URL valide").optional(),
  promotion: yup.string().optional(),
  payCashMethod: yup.boolean().default(true),
  images: yup
    .array()
    .of(yup.string().url("Chaque image doit être une URL valide"))
    .optional(),
  menu: yup
    .string()
    .matches(/^[0-9a-fA-F]{24}$/, "L'ID du menu doit être un ObjectId valide")
    .optional()
});

module.exports = {
  restaurantSchema,
};
