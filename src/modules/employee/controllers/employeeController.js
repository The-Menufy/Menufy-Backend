const EmployeeService = require("../services/employeeService");
const { employeeSchema } = require("../validators/employeeValidator");

class EmployeeController {
  async getAllEmployees(req, res) {
    try {
      const result = await EmployeeService.getAllEmployees(req.params.restaurantId);
      res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getEmployee(req, res) {
    try {
      const result = await EmployeeService.getEmployeeById(req.params.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async createEmployee(req, res) {
    try {
      await employeeSchema.validate(req.body, { abortEarly: false });
      const result = await EmployeeService.createEmployee(req.body);
      res.status(result.success ? 201 : 400).json(result);
    } catch (error) {
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors: error.errors
        });
      }
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateEmployee(req, res) {
    try {
      const result = await EmployeeService.updateEmployee(req.params.id, req.body);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteEmployee(req, res) {
    try {
      const result = await EmployeeService.deleteEmployee(req.params.id);
      res.status(result.success ? 200 : 404).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new EmployeeController();