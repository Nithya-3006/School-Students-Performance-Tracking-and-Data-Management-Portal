const express = require('express');
const app = express();
const mysql = require("mysql2/promise");
const cors = require('cors');

app.use(cors());
app.use(express.json());

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root", 
  database: "meta_school" 
});

// API endpoint to get teachers
app.get('/teachers', async (req, res) => {
  try {
    const [results] = await db.execute('SELECT * FROM Teachers');
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching teachers' });
  }
});

// API endpoint to get students
app.get('/students', async (req, res) => {
  try {
    const [results] = await db.execute(`
      SELECT 
  s.id,
  s.name,
  s.class AS rollNo,
  t.name AS teacherName,
  p.name AS parentName,
  p.email AS parentEmail,
  COALESCE(p.phone, 'N/A') AS parentPhone,
  COALESCE(attendance_percentage, 0) AS attendance,
  COALESCE(average_marks, 0) AS average,
  COALESCE(average_marks, 0) AS weeklyTests,
  COALESCE(average_marks, 0) AS academicPercentage
FROM 
  Students s
  LEFT JOIN Teachers t ON s.teacher_id = t.id
  LEFT JOIN Parents p ON s.id = p.student_id
  LEFT JOIN (
    SELECT 
      student_id,
      AVG(attendance = 1) * 100 AS attendance_percentage
    FROM 
      Attendance
    GROUP BY 
      student_id
  ) a ON s.id = a.student_id
  LEFT JOIN (
    SELECT 
      student_id,
      AVG(marks) AS average_marks
    FROM 
      Academic_Performance
    GROUP BY 
      student_id
  ) ap ON s.id = ap.student_id;
    `);
    res.send(results);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send({ message: 'Error fetching students' });
  }
});

// API endpoint to get student attendance
app.get('/students', async (req, res) => {
  try {
    const query = 'SELECT * FROM student_data';
    const [results] = await db.execute(query);
    //console.log(results);
    res.send(results);
  } catch (err) {
    console.error('Error fetching students:', err);
    res.status(500).send({ message: 'Error fetching students' });
  }
});

// API endpoint to get student academic performance
app.get('/students/:id/academic-performance', async (req, res) => {
  try {
    const studentId = req.params.id;
    const [results] = await db.execute('SELECT * FROM Academic_Performance WHERE student_id = ?', [studentId]);
    res.send(results);
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: 'Error fetching academic performance' });
  }
});



// Create a new Teacher
app.post('/teachers', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const [results] = await db.execute('INSERT INTO Teachers (name, email, phone) VALUES (?, ?, ?)', [name, email, phone]);
    res.json({ message: 'Teacher added successfully', id: results.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating teacher' });
  }
});

// Create a new Student
app.post('/students', async (req, res) => {
  try {
    const { name, rollNo, attendance, average, weeklyTests, academicPercentage, teacher_id, parentName, parentEmail, parentPhone } = req.body;
    if (!name || !rollNo || !teacher_id) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }
    const [results] = await db.execute('INSERT INTO Students (name, rollNo, attendance, average, weeklyTests, academicPercentage, teacher_id, parentName, parentEmail, parentPhone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [name, rollNo, attendance, average, weeklyTests, academicPercentage, teacher_id, parentName, parentEmail, parentPhone]);
    res.json({ message: 'Student added successfully', id: results.insertId });
  } catch (error) {
    res.status(500).json({ message: 'Error creating student' });
  }
});

// Get Students by Teacher ID
app.get('/students/teacher/:teacherId', async (req, res) => {
  try {
    const teacherId = req.params.teacherId;
    const [results] = await db.execute('SELECT * FROM Students WHERE teacher_id = ?', [teacherId]);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching students' });
  }
});


// Login endpoint
app.post('/login/:role', async (req, res) => {
  try {
    const { role } = req.params;
    const { username, password } = req.body;

    let query;
    if (role === 'admin') {
      query = 'SELECT * FROM Users WHERE username = ? AND password = ? AND role = ?';
    } else if (role === 'teacher') {
      query = 'SELECT * FROM Users u JOIN Teachers t ON u.id = t.id WHERE u.username = ? AND u.password = ? AND u.role = ?';
    } else if (role === 'student') {
      query = 'SELECT * FROM Users u JOIN Students s ON u.id = s.id WHERE u.username = ? AND u.password = ? AND u.role = ?';
    } else if (role === 'parent') {
      query = 'SELECT * FROM Users u JOIN Parents p ON u.id = p.id WHERE u.username = ? AND u.password = ? AND u.role = ?';
    } else {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const [results] = await db.execute(query, [username, password, role]);
    if (results.length > 0) {
      res.json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'An error occurred' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


async function checkDBConnection() {
  try {
    const [results] = await db.execute('SELECT 1');
    console.log('Connected to database successfully');
  } catch (err) {
    console.error('Error connecting to database:', err);
  }
}

checkDBConnection();