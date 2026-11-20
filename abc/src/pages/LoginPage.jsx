import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import BrandLayout from "../components/BrandLayout";
import FormInput from "../components/FormInput";
import PasswordField from "../components/PasswordField";

function getErrorMessage(error) {
  return typeof error === "string" ? error : "Không thể đăng nhập. Vui lòng thử lại.";
}

const PASSWORD_RESET_SESSION_KEY = "admin-password-reset-session";

function readPasswordResetSession() {
  const saved = window.localStorage.getItem(PASSWORD_RESET_SESSION_KEY);
  if (!saved) {
    return null;
  }

  let session;
  try {
    session = JSON.parse(saved);
  } catch {
    window.localStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    return null;
  }

  if (
    typeof session.username !== "string" ||
    typeof session.maskedRecoveryEmail !== "string" ||
    typeof session.requestedAt !== "number"
  ) {
    window.localStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    return null;
  }

  return session;
}

export default function LoginPage({ onAuthenticated, onReconfigureDatabase }) {
  const navigate = useNavigate();
  const [resetSession, setResetSession] = useState(readPasswordResetSession);
  const [username, setUsername] = useState(() => resetSession?.username ?? "");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isResetMode, setIsResetMode] = useState(() => Boolean(resetSession));
  const [isSendingResetOtp, setIsSendingResetOtp] = useState(false);
  const [isVerifyingResetOtp, setIsVerifyingResetOtp] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetStep, setResetStep] = useState(() => (resetSession ? "otp" : "account"));
  const [maskedRecoveryEmail, setMaskedRecoveryEmail] = useState(
    () => resetSession?.maskedRecoveryEmail ?? "",
  );
  const [lastOtpRequestedAt, setLastOtpRequestedAt] = useState(
    () => resetSession?.requestedAt ?? null,
  );
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isOtpExpired, setIsOtpExpired] = useState(false);
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  useEffect(() => {
    if (!lastOtpRequestedAt) {
      setResendSeconds(0);
      setIsOtpExpired(false);
      return undefined;
    }

    const updateOtpStatus = () => {
      const elapsedMilliseconds = Date.now() - lastOtpRequestedAt;
      setResendSeconds(Math.min(60, Math.max(0, Math.ceil((60_000 - elapsedMilliseconds) / 1000))));
      setIsOtpExpired(elapsedMilliseconds >= 5 * 60_000);
    };

    updateOtpStatus();
    const timer = window.setInterval(updateOtpStatus, 1000);
    return () => window.clearInterval(timer);
  }, [lastOtpRequestedAt]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoggingIn(true);
    try {
      const account = await invoke("authenticate_account", {
        username: username.trim(),
        password,
      });
      setPassword("");
      onAuthenticated(account);
    } catch (error) {
      if (error === "SETUP_REQUIRED") {
        navigate("/bootstrap");
      } else {
        setErrorMessage(getErrorMessage(error));
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  function handleReset() {
    setErrorMessage("");
    onReconfigureDatabase();
    navigate("/setup");
  }

  async function handleRequestPasswordReset(event) {
    event?.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    if (!username.trim()) {
      setErrorMessage("Nhập tên đăng nhập Admin trước khi yêu cầu đặt lại mật khẩu.");
      return;
    }

    setIsSendingResetOtp(true);
    try {
      const email = await invoke("send_admin_password_reset_otp", {
        username: username.trim(),
      });
      const requestedAt = Date.now();
      const session = {
        username: username.trim(),
        maskedRecoveryEmail: email,
        requestedAt,
      };
      setResetSession(session);
      try {
        window.localStorage.setItem(PASSWORD_RESET_SESSION_KEY, JSON.stringify(session));
      } catch {
        setErrorMessage(
          "OTP đã được yêu cầu nhưng không thể lưu trạng thái để tiếp tục sau khi mở lại ứng dụng.",
        );
      }
      setMaskedRecoveryEmail(email);
      setLastOtpRequestedAt(requestedAt);
      setResetOtp("");
      setResetStep("otp");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSendingResetOtp(false);
    }
  }

  async function handleVerifyResetOtp(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsVerifyingResetOtp(true);
    try {
      await invoke("verify_admin_password_reset_otp", {
        username: username.trim(),
        otp: resetOtp,
      });
      setResetStep("password");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsVerifyingResetOtp(false);
    }
  }

  async function handlePasswordReset(event) {
    event.preventDefault();
    setErrorMessage("");
    setStatusMessage("");
    if (newPassword !== confirmNewPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsResettingPassword(true);
    try {
      await invoke("reset_admin_password", {
        username: username.trim(),
        otp: resetOtp,
        newPassword,
      });
      let successMessage = "Đặt lại mật khẩu thành công. Hãy đăng nhập bằng mật khẩu mới.";
      try {
        window.localStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
      } catch {
        successMessage += " Không thể xóa trạng thái OTP đã lưu trên thiết bị.";
      }
      setResetSession(null);
      setIsResetMode(false);
      setResetStep("account");
      setMaskedRecoveryEmail("");
      setLastOtpRequestedAt(null);
      setResetOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
      setPassword("");
      setStatusMessage(successMessage);
    } catch (error) {
      if (typeof error === "string" && error.includes("OTP")) {
        setResetStep("otp");
      }
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsResettingPassword(false);
    }
  }

  function handleCancelPasswordReset() {
    let persistenceError = "";
    try {
      window.localStorage.removeItem(PASSWORD_RESET_SESSION_KEY);
    } catch {
      persistenceError =
        "Không thể xóa phiên OTP đã lưu trên thiết bị. Nếu mở lại app, bước OTP có thể được khôi phục.";
    }
    setResetSession(null);
    setIsResetMode(false);
    setResetStep("account");
    setMaskedRecoveryEmail("");
    setLastOtpRequestedAt(null);
    setResetOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setErrorMessage(persistenceError);
    setStatusMessage("");
  }

  return (
    <BrandLayout>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-iuh-blue">
          {isResetMode
            ? resetStep === "account"
              ? "Khôi phục tài khoản"
              : resetStep === "otp"
                ? "Xác minh OTP"
                : "Tạo mật khẩu mới"
            : "Chào mừng trở lại"}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          {isResetMode ? "Đặt lại mật khẩu" : "Đăng nhập hệ thống"}
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {isResetMode
            ? resetStep === "account"
              ? "Nhập tên đăng nhập Admin để nhận mã xác minh."
              : resetStep === "otp"
                ? `Nếu tài khoản hợp lệ, mã OTP đã được gửi đến ${maskedRecoveryEmail}.`
                : "Tạo mật khẩu mới để hoàn tất khôi phục tài khoản."
            : "Sử dụng tài khoản được cấp để tiếp tục quản lý nghiệp vụ Đoàn."}
        </p>
      </div>

      {statusMessage && (
        <p
          aria-live="polite"
          className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-800"
          role="status"
        >
          {statusMessage}
        </p>
      )}

      {!isResetMode ? (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="form-label">Tên đăng nhập</span>
            <FormInput
              autoComplete="username"
              autoFocus
              onChange={(event) => setUsername(event.currentTarget.value)}
              placeholder="Nhập tên đăng nhập"
              required
              value={username}
            />
          </label>

          <label className="block">
            <span className="form-label">Mật khẩu</span>
            <PasswordField
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="Nhập mật khẩu"
              required
              value={password}
            />
          </label>

          <div className="flex justify-end">
            <button
              className="text-action-compact font-medium text-iuh-blue underline decoration-iuh-blue/30 underline-offset-4 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSendingResetOtp}
              onClick={() => {
                setIsResetMode(true);
                const savedSession = resetSession;
                if (savedSession) {
                  setUsername(savedSession.username);
                  setMaskedRecoveryEmail(savedSession.maskedRecoveryEmail);
                  setLastOtpRequestedAt(savedSession.requestedAt);
                  setResetStep("otp");
                } else {
                  setResetStep("account");
                }
                setErrorMessage("");
                setStatusMessage("");
              }}
              type="button"
            >
              Quên mật khẩu?
            </button>
          </div>

          {errorMessage && (
            <p
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button className="button-primary w-full" disabled={isLoggingIn} type="submit">
            {isLoggingIn ? "Đang xác thực..." : "Đăng nhập"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {resetStep === "account" && (
            <form className="space-y-4" onSubmit={handleRequestPasswordReset}>
              <label className="block">
                <span className="form-label">Tên đăng nhập Admin</span>
                <FormInput
                  autoComplete="username"
                  autoFocus
                  onChange={(event) => setUsername(event.currentTarget.value)}
                  placeholder="admin"
                  required
                  value={username}
                />
              </label>
              <button
                className="button-primary w-full"
                disabled={isSendingResetOtp}
                type="submit"
              >
                {isSendingResetOtp ? "Đang gửi OTP..." : "Gửi mã OTP"}
              </button>
            </form>
          )}

          {resetStep === "otp" && (
            <form className="space-y-4" onSubmit={handleVerifyResetOtp}>
              <label className="block">
                <span className="form-label">Mã OTP</span>
                <FormInput
                  autoComplete="one-time-code"
                  autoFocus
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setResetOtp(event.currentTarget.value.replace(/\D/g, ""))}
                  pattern="[0-9]{6}"
                  placeholder="Nhập mã 6 chữ số"
                  required
                  value={resetOtp}
                />
              </label>
              <div className="flex justify-end">
                <button
                  className="text-action-compact font-medium text-iuh-blue underline decoration-iuh-blue/30 underline-offset-4 transition hover:text-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSendingResetOtp || resendSeconds > 0}
                  onClick={handleRequestPasswordReset}
                  type="button"
                >
                  {isSendingResetOtp
                    ? "Đang gửi..."
                    : resendSeconds > 0
                      ? `Gửi lại OTP sau ${resendSeconds}s`
                      : "Gửi lại mã OTP"}
                </button>
              </div>
              <p className="text-center text-xs leading-5 text-slate-500">
                {isOtpExpired
                  ? "Mã OTP đã hết hạn. Hãy yêu cầu mã mới."
                  : "Mã OTP có hiệu lực trong 5 phút."}
              </p>
              <button
                className="button-primary w-full"
                disabled={isVerifyingResetOtp}
                type="submit"
              >
                {isVerifyingResetOtp ? "Đang xác minh..." : "Xác minh OTP"}
              </button>
            </form>
          )}

          {resetStep === "password" && (
            <form className="space-y-4" onSubmit={handlePasswordReset}>
              <label className="block">
                <span className="form-label">Mật khẩu mới</span>
                <PasswordField
                  autoComplete="new-password"
                  name="newPassword"
                  onChange={(event) => setNewPassword(event.currentTarget.value)}
                  placeholder="Tối thiểu 12 ký tự, có hoa/thường/số/ký tự đặc biệt"
                  required
                  value={newPassword}
                />
              </label>
              <label className="block">
                <span className="form-label">Xác nhận mật khẩu mới</span>
                <PasswordField
                  autoComplete="new-password"
                  name="confirmNewPassword"
                  onChange={(event) => setConfirmNewPassword(event.currentTarget.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  required
                  value={confirmNewPassword}
                />
              </label>
              <button
                className="button-primary w-full"
                disabled={isResettingPassword}
                type="submit"
              >
                {isResettingPassword ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}

          {errorMessage && (
            <p
              aria-live="polite"
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <button
            className="text-action-compact mx-auto block font-medium text-iuh-blue underline decoration-iuh-blue/30 underline-offset-4 transition hover:text-blue-900"
            onClick={handleCancelPasswordReset}
            type="button"
          >
            Quay lại đăng nhập
          </button>
        </div>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4 text-center">
        <p className="text-xs leading-5 text-slate-500">
          Cấu hình database đã được lưu an toàn và không thể xem lại trong ứng dụng.
        </p>
        <button
          className="text-action-compact mx-auto mt-2 block font-medium text-iuh-blue underline decoration-iuh-blue/30 underline-offset-4 transition hover:text-blue-900 disabled:opacity-60"
          onClick={handleReset}
          type="button"
        >
          Đặt lại cấu hình kết nối
        </button>
      </div>
    </BrandLayout>
  );
}
