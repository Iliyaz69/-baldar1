// Соответствие ролей, их подписей и акцентных цветов интерфейса (см. раздел 4 ТЗ)
export const ROLES = {
  SUPERADMIN: { label: "Суперадминистратор", color: "role-superadmin" },
  DIRECTOR: { label: "Директор", color: "role-director" },
  METHODIST: { label: "Методист", color: "role-methodist" },
  TEACHER: { label: "Воспитатель", color: "role-teacher" },
  MEDICAL: { label: "Медперсонал", color: "role-medical" },
  PARENT: { label: "Родитель", color: "role-parent" },
};

export function roleAccent(role) {
  return ROLES[role]?.color || "brand";
}

export function roleLabel(role) {
  return ROLES[role]?.label || role;
}
