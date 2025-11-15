import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mahandeep23022005",
  database: "gymmanagement",
});

db.connect(err => {
  if (err) {
    console.error("❌ MySQL connection failed:", err);
    return;
  }
  console.log("✅ MySQL connected...");
});

// ✅ Check database structure on startup
app.get("/api/check-db", (req, res) => {
  db.query("DESCRIBE members", (err, results) => {
    if (err) {
      console.error("Error checking members table:", err);
      return res.status(500).json({ error: "Database error" });
    }
    console.log("Members table structure:", results);
    res.json({ structure: results });
  });
});

// ✅ Login API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  console.log("Login attempt:", username);

  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: "Username and password required" 
    });
  }

  db.query(
    "SELECT * FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error" 
        });
      }

      if (results.length > 0) {
        console.log("✅ Login successful for:", username);
        return res.json({ 
          success: true, 
          user: {
            user_id: results[0].user_id,
            username: results[0].username,
            role: results[0].role
          } 
        });
      } else {
        console.log("❌ Login failed for:", username);
        return res.status(401).json({ 
          success: false, 
          message: "Invalid credentials" 
        });
      }
    }
  );
});

// ✅ Fetch all members
app.get("/api/members", (req, res) => {
  db.query("SELECT * FROM members", (err, results) => {
    if (err) {
      console.error("Error fetching members:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Fetch all trainers
app.get("/api/trainers", (req, res) => {
  db.query("SELECT * FROM trainers", (err, results) => {
    if (err) {
      console.error("Error fetching trainers:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Add new member
app.post("/api/members", (req, res) => {
  console.log("Received member data:", req.body);
  
  const { first_name, last_name, email, phone, date_of_birth, join_date, plan_id, address } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !phone || !join_date) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: first_name, last_name, email, phone, and join_date are required" 
    });
  }

  // If plan_id is not provided, set it to NULL
  const finalPlanId = plan_id || null;

  const sql = `
    INSERT INTO members 
    (first_name, last_name, email, phone, date_of_birth, join_date, plan_id, address) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.log("Executing SQL:", sql);
  console.log("With values:", [first_name, last_name, email, phone, date_of_birth, join_date, finalPlanId, address]);

  db.query(sql, [
    first_name, 
    last_name, 
    email, 
    phone, 
    date_of_birth || null, 
    join_date, 
    finalPlanId, 
    address || ''
  ], (err, result) => {
    if (err) {
      console.error("Database error adding member:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.sqlMessage 
      });
    }
    console.log("Member added successfully, ID:", result.insertId);
    res.json({ 
      success: true, 
      message: "Member added successfully!",
      member_id: result.insertId 
    });
  });
});

// ✅ Add new trainer
app.post("/api/trainers", (req, res) => {
  console.log("Received trainer data:", req.body);
  
  const { first_name, last_name, email, phone, specialization, hourly_rate } = req.body;

  // Validate required fields
  if (!first_name || !last_name || !email || !phone || !specialization || !hourly_rate) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields" 
    });
  }

  const sql = `
    INSERT INTO trainers 
    (first_name, last_name, email, phone, specialization, hourly_rate) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  console.log("Executing SQL:", sql);
  console.log("With values:", [first_name, last_name, email, phone, specialization, hourly_rate]);

  db.query(sql, [
    first_name, 
    last_name, 
    email, 
    phone, 
    specialization, 
    hourly_rate
  ], (err, result) => {
    if (err) {
      console.error("Error adding trainer:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.message 
      });
    }
    console.log("Trainer added successfully, ID:", result.insertId);
    res.json({ 
      success: true, 
      message: "Trainer added successfully!",
      trainer_id: result.insertId 
    });
  });
});

// ✅ Fetch all plans
app.get("/api/plans", (req, res) => {
  db.query("SELECT * FROM plans", (err, results) => {
    if (err) {
      console.error("Error fetching plans:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ ATTENDANCE APIs

// Check-in member
app.post("/api/attendance/checkin", (req, res) => {
  const { member_id } = req.body;
  
  if (!member_id) {
    return res.status(400).json({ 
      success: false, 
      message: "Member ID is required" 
    });
  }

  const today = new Date().toISOString().split('T')[0];
  
  // Check if member already checked in today
  const checkSql = "SELECT * FROM attendance WHERE member_id = ? AND date = ? AND check_out IS NULL";
  
  db.query(checkSql, [member_id, today], (err, results) => {
    if (err) {
      console.error("Error checking attendance:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error" 
      });
    }

    if (results.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Member already checked in today" 
      });
    }

    // Insert new check-in
    const insertSql = "INSERT INTO attendance (member_id, date) VALUES (?, ?)";
    
    db.query(insertSql, [member_id, today], (err, result) => {
      if (err) {
        console.error("Error checking in member:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error: " + err.sqlMessage 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Member checked in successfully!",
        attendance_id: result.insertId,
        check_in: new Date()
      });
    });
  });
});

// Check-out member
app.post("/api/attendance/checkout", (req, res) => {
  const { member_id } = req.body;
  
  if (!member_id) {
    return res.status(400).json({ 
      success: false, 
      message: "Member ID is required" 
    });
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  
  // Find today's check-in without checkout
  const findSql = "SELECT * FROM attendance WHERE member_id = ? AND date = ? AND check_out IS NULL";
  
  db.query(findSql, [member_id, today], (err, results) => {
    if (err) {
      console.error("Error finding attendance:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error" 
      });
    }

    if (results.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No active check-in found for today" 
      });
    }

    const attendance = results[0];
    const checkInTime = new Date(attendance.check_in);
    const durationMinutes = Math.round((now - checkInTime) / (1000 * 60));
    
    // Update checkout time and duration
    const updateSql = "UPDATE attendance SET check_out = ?, workout_duration_minutes = ? WHERE attendance_id = ?";
    
    db.query(updateSql, [now, durationMinutes, attendance.attendance_id], (err, result) => {
      if (err) {
        console.error("Error checking out member:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Database error: " + err.sqlMessage 
        });
      }
      
      res.json({ 
        success: true, 
        message: "Member checked out successfully!",
        check_out: now,
        workout_duration_minutes: durationMinutes
      });
    });
  });
});

// Get attendance records for a member
app.get("/api/attendance/member/:member_id", (req, res) => {
  const { member_id } = req.params;
  
  const sql = `
    SELECT a.*, m.first_name, m.last_name 
    FROM attendance a 
    JOIN members m ON a.member_id = m.member_id 
    WHERE a.member_id = ? 
    ORDER BY a.date DESC, a.check_in DESC
    LIMIT 50
  `;
  
  db.query(sql, [member_id], (err, results) => {
    if (err) {
      console.error("Error fetching attendance:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get today's attendance
app.get("/api/attendance/today", (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const sql = `
    SELECT a.*, m.first_name, m.last_name, m.phone, m.email
    FROM attendance a 
    JOIN members m ON a.member_id = m.member_id 
    WHERE a.date = ? 
    ORDER BY a.check_in DESC
  `;
  
  db.query(sql, [today], (err, results) => {
    if (err) {
      console.error("Error fetching today's attendance:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get attendance statistics
app.get("/api/attendance/stats", (req, res) => {
  const { period = 'month' } = req.query; // day, week, month
  
  let dateFilter = "";
  if (period === 'day') {
    dateFilter = "WHERE date = CURDATE()";
  } else if (period === 'week') {
    dateFilter = "WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
  } else {
    dateFilter = "WHERE date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)";
  }
  
  const sql = `
    SELECT 
      COUNT(*) as total_visits,
      COUNT(DISTINCT member_id) as unique_members,
      AVG(workout_duration_minutes) as avg_duration,
      MAX(workout_duration_minutes) as max_duration,
      DATE_FORMAT(date, '%Y-%m-%d') as visit_date
    FROM attendance 
    ${dateFilter}
    GROUP BY date
    ORDER BY date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching attendance stats:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get member attendance summary
app.get("/api/attendance/member-stats/:member_id", (req, res) => {
  const { member_id } = req.params;
  
  const sql = `
    SELECT 
      COUNT(*) as total_visits,
      AVG(workout_duration_minutes) as avg_duration,
      SUM(workout_duration_minutes) as total_minutes,
      MIN(date) as first_visit,
      MAX(date) as last_visit
    FROM attendance 
    WHERE member_id = ?
  `;
  
  db.query(sql, [member_id], (err, results) => {
    if (err) {
      console.error("Error fetching member stats:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0] || {});
  });
});

// ✅ PAYMENT APIs

// Create payment record
app.post("/api/payments", (req, res) => {
  const { member_id, plan_id, amount, payment_date, payment_method } = req.body;
  
  if (!member_id || !plan_id || !amount || !payment_date) {
    return res.status(400).json({ 
      success: false, 
      message: "Missing required fields: member_id, plan_id, amount, payment_date" 
    });
  }

  // Calculate due date (30 days from payment date)
  const dueDate = new Date(payment_date);
  dueDate.setDate(dueDate.getDate() + 30);

  const sql = `
    INSERT INTO payments 
    (member_id, plan_id, amount, payment_date, due_date, payment_method, status) 
    VALUES (?, ?, ?, ?, ?, ?, 'Completed')
  `;

  db.query(sql, [
    member_id, 
    plan_id, 
    amount, 
    payment_date, 
    dueDate.toISOString().split('T')[0], 
    payment_method || 'Cash'
  ], (err, result) => {
    if (err) {
      console.error("Error creating payment:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.sqlMessage 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Payment recorded successfully!",
      payment_id: result.insertId 
    });
  });
});

// Get all payments with member and plan details
app.get("/api/payments", (req, res) => {
  const { status } = req.query;
  
  let whereClause = "";
  if (status && status !== 'all') {
    whereClause = `WHERE p.status = '${status}'`;
  }

  const sql = `
    SELECT 
      p.*,
      m.first_name, m.last_name, m.email, m.phone,
      pl.plan_name, pl.price as plan_price
    FROM payments p
    JOIN members m ON p.member_id = m.member_id
    JOIN plans pl ON p.plan_id = pl.plan_id
    ${whereClause}
    ORDER BY p.payment_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching payments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get payments by specific member
app.get("/api/payments/member/:member_id", (req, res) => {
  const { member_id } = req.params;
  
  const sql = `
    SELECT 
      p.*,
      pl.plan_name, pl.price as plan_price
    FROM payments p
    JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.member_id = ?
    ORDER BY p.payment_date DESC
  `;
  
  db.query(sql, [member_id], (err, results) => {
    if (err) {
      console.error("Error fetching member payments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Get overdue payments
app.get("/api/payments/overdue", (req, res) => {
  const sql = `
    SELECT 
      p.*,
      m.first_name, m.last_name, m.email, m.phone,
      pl.plan_name
    FROM payments p
    JOIN members m ON p.member_id = m.member_id
    JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE p.due_date < CURDATE() AND p.status != 'Completed'
    ORDER BY p.due_date ASC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching overdue payments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Update payment status
app.put("/api/payments/:payment_id", (req, res) => {
  const { payment_id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ 
      success: false, 
      message: "Status is required" 
    });
  }

  const sql = "UPDATE payments SET status = ? WHERE payment_id = ?";
  
  db.query(sql, [status, payment_id], (err, result) => {
    if (err) {
      console.error("Error updating payment:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.sqlMessage 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Payment status updated successfully!" 
    });
  });
});

// Delete payment
app.delete("/api/payments/:payment_id", (req, res) => {
  const { payment_id } = req.params;

  const sql = "DELETE FROM payments WHERE payment_id = ?";
  
  db.query(sql, [payment_id], (err, result) => {
    if (err) {
      console.error("Error deleting payment:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Database error: " + err.sqlMessage 
      });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Payment not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Payment deleted successfully!" 
    });
  });
});

// Get payment statistics
app.get("/api/payments/stats", (req, res) => {
  const sql = `
    SELECT 
      COUNT(*) as total_payments,
      SUM(amount) as total_revenue,
      COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_payments,
      COUNT(CASE WHEN status = 'Pending' THEN 1 END) as pending_payments,
      COUNT(CASE WHEN status = 'Overdue' THEN 1 END) as overdue_payments,
      SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0 END) as completed_revenue
    FROM payments
    WHERE MONTH(payment_date) = MONTH(CURDATE()) 
    AND YEAR(payment_date) = YEAR(CURDATE())
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching payment stats:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results[0] || {});
  });
});

// Get today's payments
app.get("/api/payments/today", (req, res) => {
  const sql = `
    SELECT 
      p.*,
      m.first_name, m.last_name,
      pl.plan_name
    FROM payments p
    JOIN members m ON p.member_id = m.member_id
    JOIN plans pl ON p.plan_id = pl.plan_id
    WHERE DATE(p.payment_date) = CURDATE()
    ORDER BY p.payment_date DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching today's payments:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  db.query("SELECT 1", (err) => {
    if (err) {
      return res.status(500).json({ status: "Database connection failed" });
    }
    res.json({ status: "Server and database are running OK" });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));