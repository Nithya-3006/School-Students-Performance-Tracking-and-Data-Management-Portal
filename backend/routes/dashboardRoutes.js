
const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/dashboard/:role/:id", (req, res) => {
  const { role, id } = req.params;

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

  const query = `SELECT * FROM ${tableName} WHERE id = ?`;
  db.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ message: "DB error" });

    if (results.length > 0) {
      res.json({ data: results[0] });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
});

module.exports = router;
