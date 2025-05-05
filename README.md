# Menufy Backend

[![Deploy on Render](https://img.shields.io/badge/Hosted%20on-Render-blue?logo=render)](https://menufy-backend.onrender.com/)

The **Menufy Backend** is a Node.js/Express REST API powering the Menufy application—a modern solution for restaurant management, menu curation, and user engagement.  
It provides endpoints for authentication, menu management, dish and ingredient handling, user roles, nutrition analysis, and more.

## 🌐 Live Demo

- **Base API URL:** [https://menufy-backend.onrender.com/](https://menufy-backend.onrender.com/)

---

## 🚀 Features

- **User Authentication:** JWT-based signup, login, and role-based access.
- **Menu & Dish Management:** CRUD for menus, dishes, categories, and ingredients.
- **Employee & Admin Management:** Role-based access controls, admin endpoints.
- **Nutrition Analysis:** Integration with Nutritionix API for dish analysis.
- **Email Integration:** Nodemailer for account verification, password reset, etc.
- **Google & Facebook OAuth:** Social login support.
- **Swagger API Docs:** Interactive API documentation (see `/api-docs` endpoint if enabled).
- **Socket.IO:** Real-time features for notifications and updates.
- **Seed Scripts:** Prepopulate database with sample data.
- **.env Configuration:** All secrets and keys managed via environment variables.

---

## 🛠️ Tech Stack

- **Node.js** & **Express**
- **MongoDB** & **Mongoose**
- **JWT** for authentication
- **Nodemailer** for mailing
- **Swagger** for API docs
- **Socket.IO** for real-time updates
- **Third-party integrations:** Nutritionix, Google OAuth, Facebook Login

---

## 🏁 Getting Started

### 1. **Clone the repository**
```sh
git clone https://github.com/The-Menufy/Menufy-Backend.git
cd Menufy-Backend
```

### 2. **Install dependencies**
```sh
npm install
```

### 3. **Configure environment variables**
Copy `.env.example` to `.env` and fill in your secrets and API keys:
```sh
cp .env.example .env
```

### 4. **Run the server**
```sh
npm start
```
The server will start on `http://localhost:5000` by default.

---

## 📦 API Endpoints

> For full, interactive documentation, visit `/api-docs` on your running server.

- `POST /auth/signup` – Register a new user
- `POST /auth/login` – Login with email/password
- `GET /menu` – Get all menus
- `POST /menu` – Create a menu (admin)
- `POST /dish` – Create a dish
- ...and many more!

---

## 🧪 Running Tests

```sh
npm test
```

---

## 💡 Environment Variables

Your `.env` file should contain the following:

```env
MONGO_URI=
BASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
REFRESH_TOKEN_SECRET=
REFRESH_TOKEN_EXPIRES_IN=
EMAIL_SERVICE=
EMAIL_USER=
EMAIL_PASSWORD=
FRONTEND_URL=
GOOGLE_CLIENT_ID=
FACEBOOK_APP_ID=
GEMINI_API_KEY=
NUTRITIONIX_APP_ID=
NUTRITIONIX_API_KEY=
```

---

## 🖥️ Deployment

- Deployed on [Render](https://render.com/)
- To redeploy, push to `main` branch or use Render dashboard

---

## 🙏 Contributing

Contributions are welcome! Please fork the repo and submit a pull request.

---

## 📄 License

[MIT](LICENSE)

---

## 👤 Author

- **Menufy Team**
- [https://menufy-backend.onrender.com/](https://menufy-backend.onrender.com/)

---
