const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.create({
    data: {
      nameStateLang: "Мамлекеттик балдар бакчасы",
      nameOffLang: "Государственный детский сад",
      shortNameState: "Бала бакча",
      shortNameOff: "Бала бакча",
      type: "Государственный",
      region: "Бишкек",
      regNumber: "12345-6789-0000-1",
      okpo: "12345678",
      inn: "00112233445566",
      city: "г. Бишкек",
      district: "Первомайский район",
      street: "ул. Ахунбаева",
      building: "125",
      phone: "+996 312 123 456",
      email: "info@example.kg",
    },
  });

  const superadminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      role: "SUPERADMIN",
      fullName: "Супер Админ",
      phone: "+996000000001",
      passwordHash: superadminPass,
    },
  });

  const directorPass = await bcrypt.hash("director123", 10);
  await prisma.user.create({
    data: {
      role: "DIRECTOR",
      fullName: "Айгуль Директорова",
      phone: "+996000000002",
      passwordHash: directorPass,
      organizationId: org.id,
    },
  });

  const group = await prisma.group.create({
    data: { organizationId: org.id, name: "test-group", ageCategory: "3-4 года" },
  });

  const teacherPass = await bcrypt.hash("teacher123", 10);
  await prisma.user.create({
    data: {
      role: "TEACHER",
      fullName: "Айжан Воспитателева",
      phone: "+996000000004",
      passwordHash: teacherPass,
      organizationId: org.id,
      teachingGroups: { connect: [{ id: group.id }] },
    },
  });

  const parentPass = await bcrypt.hash("parent123", 10);
  const parent = await prisma.user.create({
    data: {
      role: "PARENT",
      fullName: "Родитель Тестовый",
      phone: "+996000000003",
      passwordHash: parentPass,
    },
  });

  const testChild = await prisma.child.create({
    data: {
      groupId: group.id,
      fullName: "Ребёнок Тестовый",
      birthDate: new Date("2022-01-01"),
      parentId: parent.id,
    },
  });

  await prisma.child.createMany({
    data: [
      { groupId: group.id, fullName: "Айбек Тестов", birthDate: new Date("2022-03-15") },
      { groupId: group.id, fullName: "Нурай Тестова", birthDate: new Date("2022-06-02") },
    ],
  });

  const code = await prisma.paymentCode.create({
    data: {
      code: "141527700",
      shortName: "Сборы за пользование",
      fullName: "Сборы за пользование природными объектами растительного и животного мира",
      startDate: new Date("2025-11-13"),
      status: "ACTIVE",
    },
  });

  // Тестовые счета для ребёнка родителя — один оплаченный, один ожидает оплаты
  await prisma.payment.createMany({
    data: [
      {
        organizationId: org.id,
        childId: testChild.id,
        paymentCodeId: code.id,
        amount: 1500,
        status: "PAID",
        paidAt: new Date(),
      },
      {
        organizationId: org.id,
        childId: testChild.id,
        paymentCodeId: code.id,
        amount: 1988,
        status: "PENDING",
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 5),
      },
    ],
  });

  // Тестовая посещаемость за текущий месяц для ребёнка родителя
  const today = new Date();
  await prisma.attendance.createMany({
    data: [
      { childId: testChild.id, date: new Date(today.getFullYear(), today.getMonth(), 1), status: "PRESENT" },
      { childId: testChild.id, date: new Date(today.getFullYear(), today.getMonth(), 2), status: "PRESENT" },
      { childId: testChild.id, date: new Date(today.getFullYear(), today.getMonth(), 3), status: "SICK", illness: "ОРВИ" },
      { childId: testChild.id, date: new Date(today.getFullYear(), today.getMonth(), 4), status: "PRESENT" },
    ],
  });

  console.log("Тестовые данные созданы.");
  console.log("Логины:");
  console.log("  +996000000001 / admin123     — суперадмин");
  console.log("  +996000000002 / director123  — директор");
  console.log("  +996000000004 / teacher123   — воспитатель (группа test-group, 3 ребёнка)");
  console.log("  +996000000003 / parent123    — родитель");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());