const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("SUPERADMIN"));

// GET /api/archive — список удалённых записей
router.get("/", async (req, res) => {
  const records = await prisma.archiveRecord.findMany({ orderBy: { deletedAt: "desc" } });
  res.json(records);
});

// POST /api/archive/:id/restore — восстановление записи
router.post("/:id/restore", async (req, res) => {
  const record = await prisma.archiveRecord.findUnique({ where: { id: Number(req.params.id) } });
  if (!record) return res.status(404).json({ error: "Запись не найдена в архиве" });

  if (record.entityType === "Organization") {
    const { id, ...data } = record.data;
    await prisma.organization.create({ data: { ...data, id } });
  }
  // Аналогично можно добавить восстановление для Child, Payment и т.д.

  await prisma.archiveRecord.delete({ where: { id: record.id } });
  res.status(204).send();
});

module.exports = router;
