import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import BrandLogo from "./components/BrandLogo";
import AdminBootstrapPage from "./pages/AdminBootstrapPage";
import DatabaseSetupPage from "./pages/DatabaseSetupPage";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function StartupScreen({ error, onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-iuh-blue/10">
        <div className="mb-6 w-full max-w-[280px]">
          <BrandLogo />
        </div>
        <h1 className="text-xl font-bold text-slate-900">
          {error ? "Không kiểm tra được cấu hình" : "Đang khởi tạo ứng dụng"}
        </h1>
        {error ? (
          <>
            <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
            <button className="button-primary mt-6" onClick={onRetry} type="button">
              Thử lại
            </button>
          </>
        ) : (
          <p className="mt-3 text-sm text-slate-600">Đang kiểm tra cấu hình kết nối an toàn...</p>
        )}
      </section>
    </main>
  );
}

function App() {
  const [configurationStatus, setConfigurationStatus] = useState("checking");
  const [startupError, setStartupError] = useState("");
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [adminSetupRequired, setAdminSetupRequired] = useState(false);
  const [isReconfiguring, setIsReconfiguring] = useState(false);

  const checkConfiguration = useCallback(async () => {
    setStartupError("");
    setConfigurationStatus("checking");
    try {
      const configured = await invoke("get_database_configuration_status");
      const setupRequired = configured ? await invoke("get_admin_setup_required") : false;
      setAdminSetupRequired(setupRequired);
      setIsReconfiguring(false);
      setConfigurationStatus(configured ? "configured" : "unconfigured");
    } catch (error) {
      setStartupError(
        typeof error === "string" ? error : "Không thể truy cập kho lưu trữ thông tin xác thực.",
      );
      setConfigurationStatus("error");
    }
  }, []);

  useEffect(() => {
    checkConfiguration();
  }, [checkConfiguration]);

  if (configurationStatus === "checking" || configurationStatus === "error") {
    return (
      <StartupScreen
        error={configurationStatus === "error" ? startupError : ""}
        onRetry={checkConfiguration}
      />
    );
  }

  const isConfigured = configurationStatus === "configured";
  const beginDatabaseReconfiguration = () => {
    setAuthenticatedUser(null);
    setIsReconfiguring(true);
  };
  const defaultPath = isReconfiguring
    ? "/setup"
    : adminSetupRequired
      ? "/bootstrap"
      : authenticatedUser
        ? "/home"
        : "/login";

  return (
    <HashRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={isConfigured ? defaultPath : "/setup"} replace />}
        />
        <Route
          path="/setup"
          element={
            isConfigured && !isReconfiguring ? (
              <Navigate to={defaultPath} replace />
            ) : (
              <DatabaseSetupPage
                onConfigured={(setupRequired) => {
                  setAdminSetupRequired(setupRequired);
                  setIsReconfiguring(false);
                  setConfigurationStatus("configured");
                }}
              />
            )
          }
        />
        <Route
          path="/bootstrap"
          element={
            isConfigured && adminSetupRequired ? (
              <AdminBootstrapPage
                onComplete={() => {
                  setAdminSetupRequired(false);
                  setAuthenticatedUser(null);
                }}
                onReconfigureDatabase={beginDatabaseReconfiguration}
              />
            ) : (
              <Navigate to={isConfigured ? defaultPath : "/setup"} replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isConfigured ? (
              authenticatedUser ? (
                <Navigate to="/home" replace />
              ) : (
                <LoginPage
                  onAuthenticated={setAuthenticatedUser}
                  onReconfigureDatabase={beginDatabaseReconfiguration}
                />
              )
            ) : (
              <Navigate to="/setup" replace />
            )
          }
        />
        <Route
          path="/home"
          element={
            isConfigured && authenticatedUser ? (
              <DashboardPage
                user={authenticatedUser}
                onLogout={() => setAuthenticatedUser(null)}
              />
            ) : (
              <Navigate to={isConfigured ? "/login" : "/setup"} replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
