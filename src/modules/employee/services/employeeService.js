const Employee = require("../../../models/employee");

class EmployeeService {
  async getAllEmployees(restaurantId) {
    const employees = await Employee.find({ restaurantFK: restaurantId })
      .populate("restaurantFK")
      .select("-password");
    return {
      success: true,
      message: "Employees retrieved successfully",
      data: employees
    };
  }

  async getEmployeeById(id) {
    const employee = await Employee.findById(id)
      .populate("restaurantFK")
      .select("-password");
    if (!employee) {
      return {
        success: false,
        message: "Employee not found"
      };
    }
    return {
      success: true,
      message: "Employee retrieved successfully",
      data: employee
    };
  }

  async createEmployee(employeeData) {
    const employee = new Employee({
      ...employeeData,
      role: "employee"
    });
    await employee.save();
    
    const savedEmployee = await Employee.findById(employee._id)
      .populate("restaurantFK")
      .select("-password");

    return {
      success: true,
      message: "Employee created successfully",
      data: savedEmployee
    };
  }

  async updateEmployee(id, updateData) {
    const employee = await Employee.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )
      .populate("restaurantFK")
      .select("-password");

    if (!employee) {
      return {
        success: false,
        message: "Employee not found"
      };
    }

    return {
      success: true,
      message: "Employee updated successfully",
      data: employee
    };
  }

  async deleteEmployee(id) {
    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) {
      return {
        success: false,
        message: "Employee not found"
      };
    }
    return {
      success: true,
      message: "Employee deleted successfully"
    };
  }
}

module.exports = new EmployeeService();