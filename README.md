# PENSDEO Workspace

> **Transparent Agency CRM & Client Collaboration Portal**  
> *Employee logs work → Admin controls & reviews it → Client gets a transparent, verified view.*

---

## 🌟 Key Features

- 🌙 **Permanent Dark Mode Aesthetics**: Sleek, high-contrast dark mode with custom glassmorphism containers and zero light mode dependencies.
- 🔒 **Role-Based Access Control (RBAC)**: Strict route and portal isolation for `SuperAdmin`, `Manager`, `Employee`, and `Client` personas.
- 🏢 **Multi-Department Assignment**: Flexible user assignment across `Development`, `Design`, `SEO`, `Marketing`, and custom dynamic departments.
- 📝 **Rich Text Formatting**: Integrated rich text description editor with live markdown preview for projects, tasks, deliverables, and departments.
- 📅 **Date Picker Calendar Integration**: Full HTML5 native date picker support for start dates and expected delivery dates.
- 🔑 **Account Security & Self-Service Password Change**:
  - **Self-Service**: Logged-in users can update their password via current password verification.
  - **Admin Password Reset**: Admins and Managers can reset any user's password with automated Nodemailer email notifications.
- 👁️ **Manager Activity Review & Client Release**: Managers review employee work logs, attach internal/client notes, and control visibility before releasing reports to the Client Portal.
- 📁 **File Attachment Support**: Attach images, documents, and assets directly to daily updates and deliverables.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: TailwindCSS + Vanilla Glassmorphism CSS
- **Icons**: Lucide React
- **State Management**: Zustand
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB + Mongoose ORM
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **File Uploads**: Multer
- **Email Notifications**: Nodemailer (SMTP)

---

## 🚀 GitHub Push & Deployment Guide

### 1. Initialize Git & Push to GitHub

Run the following commands in your terminal to initialize git and push the repository to GitHub:

```bash
# 1. Initialize Git Repository
git init

# 2. Add files (ignoring node_modules and .env via .gitignore)
git add .

# 3. Initial Commit
git commit -m "feat: complete PENSDEO Workspace CRM implementation"

# 4. Add Remote & Push (Replace YOUR_USERNAME with your GitHub handle)
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/pensdeo-workspace.git
git push -u origin main
```

---

### 2. Deploying Backend (e.g. Render / Railway)

1. Create a new Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Connect your GitHub repository and set the **Root Directory** to `server`.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Configure Environment Variables:
   - `PORT`: `5000`
   - `MONGO_URI`: `mongodb+srv://<user>:<password>@cluster.mongodb.net/pensdeo_crm`
   - `JWT_SECRET`: `your_super_secret_jwt_key`
   - `NODE_ENV`: `production`

---

### 3. Deploying Frontend (e.g. Vercel / Netlify / Render)

1. Create a new project on [Vercel](https://vercel.com) or [Netlify](https://netlify.com).
2. Connect your GitHub repository and set the **Root Directory** to `client`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Configure Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api-url.onrender.com/api`

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas URI

### Installation

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/pensdeo-workspace.git
cd pensdeo-workspace

# Install all dependencies (Server + Client)
npm run install:all

# Set up environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### Running Locally

```bash
# Terminal 1: Start Backend API (Port 5000)
npm run server

# Terminal 2: Start Frontend Dev Server (Port 3000)
npm run client
```

Access the application at `http://localhost:3000`.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
