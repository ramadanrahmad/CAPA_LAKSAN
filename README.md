# LAKSAN (Layanan Akses Sertifikasi dan Inspeksi) 🏥

![LAKSAN Banner](https://img.shields.io/badge/BBPOM-Palembang-blue)
![React](https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql)

**LAKSAN** is an Information System for Certification and Inspection Services specifically developed for the **Balai Besar Pengawas Obat dan Makanan (BBPOM) in Palembang** (Indonesian Food and Drug Authority).

This web-based system aims to digitize the bureaucracy of certification/inspection applications and streamline the reporting of Corrective and Preventive Actions (CAPA / GAP Analysis) by Business Actors in an interactive and paperless manner.

## 🌟 Key Features

The LAKSAN application adopts a **Role-Based Access Control (RBAC)** security architecture that divides authority into 4 user entities:

1. **Business Actor / Pelaku Usaha (External):**
   - Self-service account registration.
   - Submission of Certification and Facility Inspection applications.
   - Real-time application status monitoring.
   - Interactive CAPA evaluation form submission with evidence upload feature (Image/PDF).
   - Downloading electronic certificates.
2. **Officer / Inspector (Internal):**
   - Reviewing incoming application documents.
   - Providing evaluations and GAP Analysis to Business Actors.
3. **Supervisor (Internal):**
   - Reviewing field officers' evaluation results.
   - Providing final approval and issuing certificates.
4. **Administrator (Internal):**
   - Back-Office control center for employee account management.
   - Managing system Roles and Access Rights.

## 🛠️ Technology Stack

This project is built using a Full-Stack JavaScript approach:

* **Frontend:** React.js (Vite), HTML5, CSS3.
* **Backend:** Node.js, Express.js (RESTful API).
* **Database:** MySQL (Relational Database).
* **Security:** JSON Web Tokens (JWT) for session authentication, Bcrypt for password hashing.

## 🚀 Installation Guide (Running Locally)

Follow these steps to run the LAKSAN system on your local machine:

### 1. Database Setup
1. Ensure you have **XAMPP** (or any other MySQL server) installed.
2. Start the **Apache** and **MySQL** modules in the XAMPP Control Panel.
3. Create a new database in phpMyAdmin (e.g., `laksan_db`).
4. Import the database schema file located at `database/schema.sql` into the created database.

### 2. Backend Configuration
1. Open terminal/CMD and navigate to the `backend` directory.
   ```bash
   cd backend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Rename the `.env.example` file to `.env`, then adjust your database credentials (DB_NAME, DB_USER, DB_PASSWORD).
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 3. Frontend Configuration
1. Open a new terminal (keep the backend terminal running) and navigate to the `frontend` directory.
   ```bash
   cd frontend
   ```
2. Install all dependencies:
   ```bash
   npm install
   ```
3. Run the web application:
   ```bash
   npm run dev
   ```
4. Open your browser and access the provided URL (usually `http://localhost:5173`).

## 👨‍💻 Developer
Developed by **Rahmad Ramadan** as part of an Internship Program at the Balai Besar Pengawas Obat dan Makanan (BBPOM) in Palembang (2026).

---
*© 2026 LAKSAN BBPOM Palembang. All rights reserved.*
