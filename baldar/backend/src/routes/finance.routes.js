const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, scopeToOwnOrganization } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/finance/summary?organizationId=  — агрегированная статистика
// Суперадмин без organizationId получает сводку по всей сети
router.get("/summary", async (req, res) => {
  const orgId = req.query.organizationId ? Number(req.query.organizationId) : undefined;
  if (orgId && req.user.role !== "SUPERADMIN" && req.user.organizationId !== orgId) {
    return res.status(403).json({ error: "Нет доступа" });
  }
  const where = orgId ? { organizationId: orgId } : req.user.role === "SUPERADMIN" ? {} : { organizationId: req.user.organizationId };

  const [totalAgg, paidAgg, pendingCount, overdueAgg] = await Promise.all([
    prisma.payment.aggregate({ where, _sum: { amount: true } }),
    prisma.payment.aggregate({ where: { ...where, status: "PAID" }, _sum: { amount: true }, _count: true }),
    prisma.payment.count({ where: { ...where, status: "PENDING" } }),
    prisma.payment.aggregate({ where: { ...where, status: "OVERDUE" }, _sum: { amount: true } }),
  ]);

  res.json({
    totalIncome: totalAgg._sum.amount || 0,
    paidAmount: paidAgg._sum.amount || 0,
    paidCount: paidAgg._count || 0,
    pendingCount,
    debt: overdueAgg._sum.amount || 0,
  });
});

// GET /api/finance/payments — список платежей с фильтрами
router.get("/payments", async (req, res) => {
  const orgId = req.query.organizationId ? Number(req.query.organizationId) : req.user.organizationId;
  if (req.user.role !== "SUPERADMIN" && orgId !== req.user.organizationId) {
    return res.status(403).json({ error: "Нет доступа" });
  }
  const payments = await prisma.payment.findMany({
    where: req.user.role === "SUPERADMIN" && !req.query.organizationId ? {} : { organizationId: orgId },
    include: { child: true, paymentCode: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(payments);
});

module.exports = router;
