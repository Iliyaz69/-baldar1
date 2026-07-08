import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import Login from "./pages/Login";
import Overview from "./pages/Overview";
import Organizations from "./pages/Organizations";
import OrganizationForm from "./pages/OrganizationForm";
import PaymentCodes from "./pages/PaymentCodes";
import Finance from "./pages/Finance";
import Attendance from "./pages/Attendance";
import Archive from "./pages/Archive";
import TeacherAttendance from "./pages/TeacherAttendance";
import ParentDashboard from "./pages/ParentDashboard";
import ComingSoon from "./pages/ComingSoon";

function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Ограничивает доступ к маршруту списком ролей на уровне фронтенда
// (реальная проверка прав в любом случае выполняется на бэкенде)
function RequireRole({ roles, children }) {
  const user = getUser();
  if (!roles.includes(user?.role)) {
    return <ComingSoon />;
  }
  return children;
}

// Главная страница отличается в зависимости от роли пользователя
function HomeRoute() {
  const user = getUser();
  if (user?.role === "SUPERADMIN") return <Overview />;
  if (user?.role === "TEACHER") return <TeacherAttendance />;
  if (user?.role === "PARENT") return <ParentDashboard />;
  return <ComingSoon />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<HomeRoute />} />
        <Route
          path="/organizations"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <Organizations />
            </RequireRole>
          }
        />
        <Route
          path="/organizations/new"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <OrganizationForm />
            </RequireRole>
          }
        />
        <Route
          path="/organizations/:id/edit"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <OrganizationForm />
            </RequireRole>
          }
        />
        <Route
          path="/payment-codes"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <PaymentCodes />
            </RequireRole>
          }
        />
        <Route
          path="/finance"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <Finance />
            </RequireRole>
          }
        />
        <Route
          path="/attendance"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <Attendance />
            </RequireRole>
          }
        />
        <Route
          path="/archive"
          element={
            <RequireRole roles={["SUPERADMIN"]}>
              <Archive />
            </RequireRole>
          }
        />
      </Route>
    </Routes>
  );
}