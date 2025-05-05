const yup = require("yup");
const { userSchema } = require("../../user/validators/userValidator");

const employeeSchema = userSchema.shape({
  salary: yup
    .number()
    .positive("Salary must be positive")
    .required("Salary is required"),
  restaurant: yup.string().required("Restaurant ID is required"),
});

module.exports = {
  employeeSchema,
};
