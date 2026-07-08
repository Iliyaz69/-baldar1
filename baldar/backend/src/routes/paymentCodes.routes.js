const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth, requireRole("SUPERADMIN"));

// GET /api/payment-codes
router.get("/", async (req, res) => {
  const codes = await prisma.paymentCode.findMany({ orderBy: { createdAt: "desc" } });
  res.json(codes);
});

// POST /api/payment-codes
router.post("/", async (req, res) => {
  try {
    const code = await prisma.paymentCode.create({ data: req.body });
    res.status(201).json(code);
  } catch (err) {
    res.status(400).json({ error: "Не удалось создать код", details: err.message });
  }
});

// PUT /api/payment-codes/:id
router.put("/:id", async (req, res) => {
  try {
    const code = await prisma.paymentCode.update({
      where: { id: Number(req.params.id) },
      data: req.body,
    });
    res.json(code);
  } catch (err) {
    res.status(400).json({ error: "Не удалось обновить код", details: err.message });
  }
});

module.exports = router;
