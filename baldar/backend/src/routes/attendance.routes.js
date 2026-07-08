const express = require("express");
const prisma = require("../lib/prisma");
const { requireAuth, requireRole } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);

// POST /api/attendance — отметка присутствия/болезни (воспитатель, медперсонал, директор)
router.post("/", requireRole("TEACHER", "MEDICAL", "DIRECTOR"), async (req, res) => {
  const { childId, date, status, illness } = req.body;

  if (!childId || !date || !status) {
    return res.status(400).json({ error: "Не указаны обязательные поля: childId, date, status" });
  }

  // Воспитатель может отмечать только детей из своих групп
  if (req.user.role === "TEACHER") {
    const child = await prisma.child.findUnique({
      where: { id: Number(childId) },
      include: { group: { include: { teachers: { select: { id: true } } } } },
    });
    const isOwnGroup = child?.group.teachers.some((t) => t.id === req.user.id);
    if (!isOwnGroup) {
      return res.status(403).json({ error: "Этот ребёнок не относится к вашей группе" });
    }
  }

  try {
    const record = await prisma.attendance.upsert({
      where: { childId_date: { childId: Number(childId), date: new Date(date) } },
      update: { status, illness: status === "SICK" ? illness : null },
      create: { childId: Number(childId), date: new Date(date), status, illness: status === "SICK" ? illness : null },
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: "Не удалось сохранить отметку", details: err.message });
  }
});

// GET /api/attendance/my-groups?date=YYYY-MM-DD — список групп воспитателя с детьми
// и их отметкой посещаемости на выбранную дату (по умолчанию — сегодня)
router.get("/my-groups", requireRole("TEACHER"), async (req, res) => {
  const day = req.query.date ? new Date(req.query.date) : new Date();
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const groups = await prisma.group.findMany({
    where: { teachers: { some: { id: req.user.id } } },
    include: {
      children: {
        where: { status: "ACTIVE" },
        include: {
          attendance: { where: { date: { gte: dayStart, lt: dayEnd } } },
        },
        orderBy: { fullName: "asc" },
      },
    },
  });

  const result = groups.map((g) => ({
    id: g.id,
    name: g.name,
    ageCategory: g.ageCategory,
    children: g.children.map((c) => ({
      id: c.id,
      fullName: c.fullName,
      attendanceToday: c.attendance[0] || null,
    })),
  }));

  res.json({ date: dayStart.toISOString().slice(0, 10), groups: result });
});

// GET /api/attendance/report?organizationId=&period=day|month
router.get("/report", async (req, res) => {
  const orgId = req.query.organizationId ? Number(req.query.organizationId) : req.user.organizationId;
  if (req.user.role !== "SUPERADMIN" && orgId !== req.user.organizationId) {
    return res.status(403).json({ error: "Нет доступа" });
  }

  const now = new Date();
  const start =
    req.query.period === "month"
      ? new Date(now.getFullYear(), now.getMonth(), 1)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const where = {
    date: { gte: start },
    child: orgId ? { group: { organizationId: orgId } } : undefined,
  };

  const [present, sick, other, total, sickRecords, organizations] = await Promise.all([
    prisma.attendance.count({ where: { ...where, status: "PRESENT" } }),
    prisma.attendance.count({ where: { ...where, status: "SICK" } }),
    prisma.attendance.count({ where: { ...where, status: "OTHER" } }),
    prisma.attendance.count({ where }),
    prisma.attendance.findMany({ where: { ...where, status: "SICK" }, select: { illness: true } }),
    prisma.organization.findMany({
      where: orgId ? { id: orgId } : {},
      include: { branches: true, groups: { include: { children: { include: { attendance: { where: { date: { gte: start } } } } } } } },
    }),
  ]);

  // Разбивка по видам болезней (ОРВИ, Грипп, Ангина, Ветрянка, Другое)
  const illnessBreakdown = {};
  for (const rec of sickRecords) {
    const key = rec.illness || "Другое";
    illnessBreakdown[key] = (illnessBreakdown[key] || 0) + 1;
  }

  // Детализация по организациям
  const organizationDetails = organizations.map((org) => {
    const allAttendance = org.groups.flatMap((g) => g.children.flatMap((c) => c.attendance));
    const orgPresent = allAttendance.filter((a) => a.status === "PRESENT").length;
    const orgSick = allAttendance.filter((a) => a.status === "SICK").length;
    const orgTotal = allAttendance.length;
    return {
      organizationId: org.id,
      organizationName: org.shortNameOff || org.nameOffLang,
      branch: org.branches[0]?.name || "—",
      total: orgTotal,
      present: orgPresent,
      sick: orgSick,
      sickPercent: orgTotal ? Math.round((orgSick / orgTotal) * 100) : 0,
    };
  });

  res.json({
    present,
    sick,
    other,
    total,
    attendanceRate: total ? Math.round((present / total) * 100) : 0,
    illnessBreakdown,
    organizationDetails,
  });
});

module.exports = router;
