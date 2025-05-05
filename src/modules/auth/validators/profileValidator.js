const yup = require("yup");
// Validation schemas
const profileUpdateSchema = yup.object({
  firstName: yup.string().trim(),
  lastName: yup.string().trim(),
  email: yup.string().email("Invalid email").trim().lowercase(),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  image: yup.string().nullable(),
  phone: yup.string().nullable(),
  address: yup.string().nullable(),
  birthday: yup.string().nullable(),
});

module.exports = {
  profileUpdateSchema,
};
