const superAdminService = require("../services/superadminService");

const yup = require("yup");
const { superAdminSchema } = require("../../superAdmin/validators/superAdminValidator");

class SuperAdminController {
    async createSuperAdmin(req, res) {
        try {
        //  console.log("RQ :", req.body); 
      
          await superAdminSchema.validate(req.body, { abortEarly: false });
      
          const result = await superAdminService.createSuperAdmin(req.body);
          return res.status(201).json({
            success: true,
            data: result,
          });
        } catch (error) {
          //console.error("Error :", error);
      
          if (error instanceof yup.ValidationError) {
            return res.status(400).json({
              success: false,
              message: "Validation error",
              errors: error.errors,
            });
          }
          return res.status(500).json({
            success: false,
            message: error.message || "Error during creation SuperAdmin",
          });
        }
      }
      
  async getAllSuperAdmins(req, res) {
    try {
      const admins = await superAdminService.getAllSuperAdmins();
      res.status(200).json({ success: true, data: admins });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getSuperAdminById(req, res) {
    try {
      const { id } = req.params;
      const admin = await superAdminService.getSuperAdminById(id);
      res.status(200).json({ success: true, data: admin });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async updateSuperAdmin(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;
      const updatedAdmin = await superAdminService.updateSuperAdmin(id, updates);
      res.status(200).json({ success: true, data: updatedAdmin });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteSuperAdmin(req, res) {
    try {
      const { id } = req.params;
      const response = await superAdminService.deleteSuperAdmin(id);
      res.status(200).json({ success: true, message: response.message });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
/*
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await superAdminService.login(email, password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }*/
}

module.exports = new SuperAdminController();
