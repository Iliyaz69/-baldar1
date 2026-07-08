const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// GET /api/organizations — список (только суперадмин)
router.get("/", requireRole("SUPERADMIN"), async (req, res) => {
  const { search } = req.query;
  const organizations = await prisma.organization.findMany({
    where: search
      ? {
          OR: [
            { nameOffLang: { contains: search, mode: "insensitive" } },
            { inn: { contains: search } },
          ],
        }
      : undefined,
    include: { bankAccounts: true, branches: true },
    orderBy: { id: "asc" },
  });
  res.json(organizations);
});

// GET /api/organizations/:id
router.get("/:id", async (req, res) => {
  const org = await prisma.organization.findUnique({
    where: { id: Number(req.params.id) },
    include: { bankAccounts: true, branches: true, groups: true },
  });
  if (!org) return res.status(404).json({ error: "Организация не найдена" });
  if (req.user.role !== "SUPERADMIN" && req.user.organizationId !== org.id) {
    return res.status(403).json({ error: "Нет доступа" });
  }
  res.json(org);
});

// Отделяет поля организации от вложенных массивов bankAccounts/branches
function splitPayload(body) {
  const { bankAccounts, branches, groups, id, createdAt, updatedAt, ...orgFields } = body;
  return { orgFields, bankAccounts: bankAccounts || [], branches: branches || [] };
}

// POST /api/organizations — создание (только суперадмин), с вложенными счетами и филиалами
router.post("/", requireRole("SUPERADMIN"), async (req, res) => {
  const { orgFields, bankAccounts, branches } = splitPayload(req.body);
  try {
    const org = await prisma.organization.create({
      data: {
        ...orgFields,
        bankAccounts: { create: bankAccounts.map(({ accountNumber, bankName, purpose }) => ({ accountNumber, bankName, purpose })) },
        branches: { create: branches.map(({ name, address }) => ({ name, address })) },
      },
      include: { bankAccounts: true, branches: true },
    });
    res.status(201).json(org);
  } catch (err) {
    res.status(400).json({ error: "Не удалось создать организацию", details: err.message });
  }
});

// PUT /api/organizations/:id — редактирование (только суперадмин)
// Банковские счета и филиалы полностью пересоздаются на основе присланного списка (простая стратегия для MVP)
router.put("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const { orgFields, bankAccounts, branches } = splitPayload(req.body);
  try {
    const org = await prisma.$transaction(async (tx) => {
      await tx.bankAccount.deleteMany({ where: { organizationId: id } });
      await tx.branch.deleteMany({ where: { organizationId: id } });
      return tx.organization.update({
        where: { id },
        data: {
          ...orgFields,
          bankAccounts: { create: bankAccounts.map(({ accountNumber, bankName, purpose }) => ({ accountNumber, bankName, purpose })) },
          branches: { create: branches.map(({ name, address }) => ({ name, address })) },
        },
        include: { bankAccounts: true, branches: true },
      });
    });
    res.json(org);
  } catch (err) {
    res.status(400).json({ error: "Не удалось обновить организацию", details: err.message });
  }
});

// DELETE /api/organizations/:id — удаление с копией в архив
router.delete("/:id", requireRole("SUPERADMIN"), async (req, res) => {
  const id = Number(req.params.id);
  const org = await prisma.organization.findUnique({ where: { id } });
  if (!org) return res.status(404).json({ error: "Организация не найдена" });

  await prisma.$transaction([
    prisma.archiveRecord.create({
      data: { entityType: "Organization", entityId: id, data: org, deletedBy: req.user.id },
    }),
    prisma.organization.delete({ where: { id } }),
  ]);

  res.status(204).send();
});

module.exports = router;
