const express = require("express");
const { exec } = require("child_process");
const router = express.Router();

// ВРЕМЕННЫЙ маршрут для применения миграций базы данных.
// После использования — обязательно удалить этот файл и его подключение в index.js!
router.get("/run-migrations", (req, res) => {
  if (req.query.key !== "baldar_setup_2026") {
    return res.status(403).json({ error: "Доступ запрещён" });
  }

  exec("npx prisma migrate deploy", { cwd: __dirname + "/../.." }, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message, stdout, stderr });
    }
    res.json({ success: true, stdout, stderr });
  });
});

module.exports = router;