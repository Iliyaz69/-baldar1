const jwt = require("jsonwebtoken");

// Проверяет JWT из заголовка Authorization: Bearer <token>
// и кладёт данные пользователя в req.user (id, role, organizationId)
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Требуется авторизация" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { id, role, organizationId }
    next();
  } catch (err) {
    return res.status(401).json({ error: "Недействительный или истёкший токен" });
  }
}

// Ограничивает доступ к маршруту списком ролей: requireRole("SUPERADMIN", "DIRECTOR")
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Требуется авторизация" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Недостаточно прав для этого действия" });
    }
    next();
  };
}

// Утилита для построения where-условия Prisma: суперадмин видит всё,
// остальные роли — только данные своей организации.
function scopeToOwnOrganization(req, field = "organizationId") {
  if (req.user.role === "SUPERADMIN") return {};
  return { [field]: req.user.organizationId };
}

module.exports = { requireAuth, requireRole, scopeToOwnOrganization };
