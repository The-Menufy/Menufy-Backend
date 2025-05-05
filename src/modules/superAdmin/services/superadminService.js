const SuperAdmin = require("../../../models/superAdmin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

class SuperAdminService {
    async createSuperAdmin(data) {
        const { email, password } = data;
      
     /*   if (!email || !password) {
          throw new Error("All fields (, email, password) are required
");
        }*/
      
        const existingAdmin = await SuperAdmin.findOne({ email });
        if (existingAdmin) throw new Error("Super Admin already exists");
      
        const hashedPassword = await bcrypt.hash(password, 10);
        const newAdmin = await SuperAdmin.create({
          email,
          password: hashedPassword,
        });
      
        return newAdmin;
      }
      
  async getAllSuperAdmins() {
    return await SuperAdmin.find();
  }

  async getSuperAdminById(id) {
    const admin = await SuperAdmin.findById(id);
    if (!admin) throw new Error("Super Admin not found");
    return admin;
  }

  async updateSuperAdmin(id, updates) {
    const admin = await SuperAdmin.findByIdAndUpdate(id, updates, { new: true });
    if (!admin) throw new Error("Super Admin not found");
    return admin;
  }

  async deleteSuperAdmin(id) {
    const admin = await SuperAdmin.findByIdAndDelete(id);
    if (!admin) throw new Error("Super Admin not found");
    return { message: "Super Admin deleted successfully" };
  }
/*
  async login(email, password) {
    const admin = await SuperAdmin.findOne({ email });
    if (!admin) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ adminId: admin._id, email: admin.email }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return { token, admin };
  }*/
}

module.exports = new SuperAdminService();
