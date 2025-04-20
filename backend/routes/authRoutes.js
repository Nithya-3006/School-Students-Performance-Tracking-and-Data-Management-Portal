
const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login/:role", (req, res) => {
  const { email, password } = req.body;
  const role = req.params.role;

  const tableMap = {
    admin: "admin",
    parent: "parents",
    student: "students",
    teacher: "teachers"
  };

  const tableName = tableMap[role];

  if (!tableName) {
    return res.status(400).json({ message: "Invalid role" });
  }

  const query = `SELECT * FROM ${tableName} WHERE email = ? AND password = ?`;
  db.query(query, [email, password], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (results.length > 0) {
      res.json({ message: "Login success", user: results[0] });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });
});

module.exports = router;
