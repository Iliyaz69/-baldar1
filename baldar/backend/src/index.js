require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const organizationsRoutes = require("./routes/organizations.routes");
const paymentCodesRoutes = require("./routes/paymentCodes.routes");
const financeRoutes = require("./routes/finance.routes");
const financeOrganizationsRoutes = require("./routes/financeOrganizations.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const overviewRoutes = require("./routes/overview.routes");
const archiveRoutes = require("./routes/archive.routes");
const parentRoutes = require("./routes/parent.routes");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationsRoutes);
app.use("/api/payment-codes", paymentCodesRoutes);
app.use("/api/finance", financeRoutes);
app.use("/api/finance-organizations", financeOrganizationsRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/overview", overviewRoutes);
app.use("/api/archive", archiveRoutes);
app.use("/api/parent", parentRoutes);

// Обработчик ошибок по умолчанию
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API запущено на http://localhost:${PORT}`);
});