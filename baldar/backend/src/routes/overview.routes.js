const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("SUPERADMIN"));

// GET /api/overview — сводка для дашборда "Обзор системы"
router.get("/", async (req, res) => {
  const [orgCount, childCount, userCount, incomeAgg] = await Promise.all([
    prisma.organization.count(),
    prisma.child.count(),
    prisma.user.count(),
    prisma.payment.aggregate({ _sum: { amount: true } }),
  ]);

  const totalAttendance = await prisma.attendance.count();
  const presentCount = await prisma.attendance.count({ where: { status: "PRESENT" } });

  res.json({
    organizationsTotal: orgCount,
    childrenTotal: childCount,
    usersTotal: userCount,
    monthlyTurnover: incomeAgg._sum.amount || 0,
    averageAttendanceRate: totalAttendance ? Math.round((presentCount / totalAttendance) * 100) : 0,
    systemStatus: "STABLE",
  });
});

module.exports = router;
