const yup = require("yup");
const { userSchema } = require("../../user/validators/userValidator");

const adminSchema = userSchema.shape({
  restaurant: yup.string().required(),
  isVerified: yup.boolean().default(false),
});

module.exports = {
  adminSchema,
};
