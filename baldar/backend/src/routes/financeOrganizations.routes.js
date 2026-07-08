const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/finance/organizations — детализация по организациям и группам (см. скриншот "Финансы")
router.get("/", async (req, res) => {
  const orgs = await prisma.organization.findMany({
    where: req.user.role === "SUPERADMIN" ? {} : { id: req.user.organizationId },
    include: {
      groups: { include: { children: true } },
      payments: true,
    },
  });

  const result = orgs.map((org) => {
    const totalAmount = org.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const paidPayments = org.payments.filter((p) => p.status === "PAID");
    const pendingPayments = org.payments.filter((p) => p.status !== "PAID");
    const debt = org.payments.filter((p) => p.status === "OVERDUE").reduce((s, p) => s + Number(p.amount), 0);

    const groups = org.groups.map((g) => {
      const childIds = g.children.map((c) => c.id);
      const paidChildren = new Set(
        org.payments.filter((p) => p.status === "PAID" && childIds.includes(p.childId)).map((p) => p.childId)
      );
      return {
        id: g.id,
        name: g.name,
        totalChildren: g.children.length,
        paidChildren: paidChildren.size,
        unpaidChildren: g.children.length - paidChildren.size,
      };
    });

    return {
      id: org.id,
      name: org.shortNameOff || org.nameOffLang,
      totalAmount,
      paidCount: paidPayments.length,
      pendingCount: pendingPayments.length,
      debt,
      groups,
    };
  });

  res.json(result);
});

module.exports = router;
