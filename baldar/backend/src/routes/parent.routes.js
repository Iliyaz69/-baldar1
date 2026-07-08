const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("PARENT"));

// Проверяет, что запрошенный ребёнок действительно принадлежит текущему родителю.
// Возвращает объект Child или null, если доступ запрещён/ребёнок не найден.
async function getOwnChild(req, childId) {
  const child = await prisma.child.findUnique({ where: { id: Number(childId) } });
  if (!child || child.parentId !== req.user.id) return null;
  return child;
}

// GET /api/parent/children — список детей текущего родителя
router.get("/children", async (req, res) => {
  const children = await prisma.child.findMany({
    where: { parentId: req.user.id },
    include: { group: { include: { organization: true } } },
    orderBy: { fullName: "asc" },
  });

  res.json(
    children.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      birthDate: c.birthDate,
      status: c.status,
      groupName: c.group?.name,
      ageCategory: c.group?.ageCategory,
      organizationName: c.group?.organization?.shortNameOff || c.group?.organization?.nameOffLang,
    }))
  );
});

// GET /api/parent/children/:childId/attendance?month=YYYY-MM — история посещаемости за месяц
router.get("/children/:childId/attendance", async (req, res) => {
  const child = await getOwnChild(req, req.params.childId);
  if (!child) return res.status(403).json({ error: "Нет доступа к данным этого ребёнка" });

  const [yearStr, monthStr] = (req.query.month || "").split("-");
  const now = new Date();
  const year = yearStr ? Number(yearStr) : now.getFullYear();
  const month = monthStr ? Number(monthStr) - 1 : now.getMonth();

  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 1);

  const records = await prisma.attendance.findMany({
    where: { childId: child.id, date: { gte: start, lt: end } },
    orderBy: { date: "asc" },
  });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const presentDays = records.filter((r) => r.status === "PRESENT").length;
  const sickDays = records.filter((r) => r.status === "SICK").length;
  const otherDays = records.filter((r) => r.status === "OTHER").length;

  res.json({
    month: `${year}-${String(month + 1).padStart(2, "0")}`,
    daysInMonth,
    presentDays,
    sickDays,
    otherDays,
    attendanceRate: records.length ? Math.round((presentDays / records.length) * 100) : 0,
    records: records.map((r) => ({
      date: r.date,
      status: r.status,
      illness: r.illness,
    })),
  });
});

// GET /api/parent/children/:childId/payments — счета и статус оплаты ребёнка
router.get("/children/:childId/payments", async (req, res) => {
  const child = await getOwnChild(req, req.params.childId);
  if (!child) return res.status(403).json({ error: "Нет доступа к данным этого ребёнка" });

  const payments = await prisma.payment.findMany({
    where: { childId: child.id },
    include: { paymentCode: true },
    orderBy: { createdAt: "desc" },
  });

  const totalDue = payments.filter((p) => p.status !== "PAID").reduce((s, p) => s + Number(p.amount), 0);

  res.json({
    totalDue,
    payments: payments.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      dueDate: p.dueDate,
      paidAt: p.paidAt,
      codeName: p.paymentCode.shortName,
    })),
  });
});

module.exports = router;