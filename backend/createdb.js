import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

async function createDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS gym;`);
    console.log("Database 'gym' checked/created.");

    await connection.query(`USE gym;`);

    // Admin Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS Admin (
            admin_id INT PRIMARY KEY AUTO_INCREMENT,
            username VARCHAR(50) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Gyms Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS gyms (
            gym_id INT PRIMARY KEY AUTO_INCREMENT,
            admin_id INT NOT NULL,
            gym_name VARCHAR(150) NOT NULL,
            address VARCHAR(255),
            phone VARCHAR(20),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE
        );
    `);

    // Trainers Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS trainers (
            trainer_id INT PRIMARY KEY AUTO_INCREMENT,
            gym_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            specialization VARCHAR(100),
            salary DECIMAL(10,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE
        );
    `);

    // Plans Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS plans (
            plan_id INT PRIMARY KEY AUTO_INCREMENT,
            gym_id INT NOT NULL,
            plan_name VARCHAR(100) NOT NULL,
            duration INT NOT NULL COMMENT 'Duration in days',   
            price DECIMAL(10,2) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE
        );
    `);

    // Members Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS members (
            member_id INT PRIMARY KEY AUTO_INCREMENT,
            gym_id INT NOT NULL,
            name VARCHAR(100) NOT NULL,
            phone VARCHAR(20),
            email VARCHAR(100),
            gender ENUM('male','female','other'),
            trainer_id INT,
            join_date DATE DEFAULT (CURRENT_DATE),
            membership_status ENUM('active','inactive') DEFAULT 'inactive',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (gym_id) REFERENCES gyms(gym_id) ON DELETE CASCADE,
            FOREIGN KEY (trainer_id) REFERENCES trainers(trainer_id) ON DELETE SET NULL
        );
    `);

    // Subscriptions Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS subscriptions (
            subscription_id INT PRIMARY KEY AUTO_INCREMENT,
            member_id INT NOT NULL,
            plan_id INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            amount_paid DECIMAL(10,2),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
            FOREIGN KEY (plan_id) REFERENCES plans(plan_id) ON DELETE CASCADE
        );
    `);

    // Attendance Table
    await connection.query(`
        CREATE TABLE IF NOT EXISTS attendance (
            attendance_id INT PRIMARY KEY AUTO_INCREMENT,
            member_id INT NOT NULL,
            date DATE NOT NULL,
            status ENUM('present', 'absent') DEFAULT 'present',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (member_id) REFERENCES members(member_id) ON DELETE CASCADE,
            UNIQUE KEY unique_attendance (member_id, date)
        );
    `);

    console.log("All tables created successfully!");
    await connection.end();
}

createDatabase().catch(err => {
    console.error("Error creating database:", err);
    process.exit(1);
});
