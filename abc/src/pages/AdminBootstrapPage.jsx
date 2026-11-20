import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";
import BrandLayout from "../components/BrandLayout";
import FormInput from "../components/FormInput";
import PasswordField from "../components/PasswordField";

function getErrorMessage(error) {
  return typeof error === "string" ? error : "Không thể hoàn tất thiết lập Admin.";
}

export default function AdminBootstrapPage({ onComplete, onReconfigureDatabase }) {
  const navigate = useNavigate();
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("bootstrap");
  const [errorMessage, setErrorMessage] = useState("");
  const [isWorking, setIsWorking] = useState(false);

  async function handleSendOtp(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsWorking(true);
    try {
      const email = await invoke("send_admin_setup_otp", {
        bootstrapToken: bootstrapToken.trim(),
        adminPassword,
      });
      setRecoveryEmail(email);
      setStep("otp");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsWorking(true);
    try {
      await invoke("verify_admin_setup_otp", {
        bootstrapToken: bootstrapToken.trim(),
        otp,
      });
      setStep("password");
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  async function handleCompleteSetup(event) {
    event.preventDefault();
    setErrorMessage("");
    if (newPassword !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp.");
      return;
    }

    setIsWorking(true);
    try {
      await invoke("complete_admin_setup", {
        bootstrapToken: bootstrapToken.trim(),
        newPassword,
      });
      setBootstrapToken("");
      setAdminPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onComplete();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsWorking(false);
    }
  }

  function handleResetConfiguration() {
    setErrorMessage("");
    onReconfigureDatabase();
    navigate("/setup");
  }

  return (
    <BrandLayout>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-iuh-blue">
          Thiết lập bảo mật
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Kích hoạt Admin
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          {step === "bootstrap" &&
            "Nhập mã bootstrap được hiển thị khi chạy init.sh và mật khẩu Admin tạm để gửi OTP."}
          {step === "otp" && `Nhập mã 6 chữ số đã gửi đến ${recoveryEmail}.`}
          {step === "password" &&
            "Email đã được xác minh. Tạo mật khẩu mới để hoàn tất kích hoạt Admin."}
        </p>
      </div>

      {step === "bootstrap" && (
        <form className="space-y-4" onSubmit={handleSendOtp}>
          <label className="block">
            <span className="form-label">Mã bootstrap</span>
            <FormInput
              autoComplete="off"
              className="font-mono"
              onChange={(event) => setBootstrapToken(event.currentTarget.value)}
              placeholder="Dán mã bootstrap từ terminal"
              required
              value={bootstrapToken}
            />
          </label>
          <label className="block">
            <span className="form-label">Mật khẩu Admin tạm thời</span>
            <PasswordField
              autoComplete="current-password"
              name="adminPassword"
              onChange={(event) => setAdminPassword(event.currentTarget.value)}
              placeholder="Nhập admin123"
              required
              value={adminPassword}
            />
          </label>
          <button className="button-primary w-full" disabled={isWorking} type="submit">
            {isWorking ? "Đang gửi OTP..." : "Gửi mã xác minh email"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form className="space-y-4" onSubmit={handleVerifyOtp}>
          <label className="block">
            <span className="form-label">Mã OTP</span>
            <FormInput
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              onChange={(event) => setOtp(event.currentTarget.value.replace(/\D/g, ""))}
              pattern="[0-9]{6}"
              placeholder="Nhập mã 6 chữ số"
              required
              value={otp}
            />
          </label>
          <button className="button-primary w-full" disabled={isWorking} type="submit">
            {isWorking ? "Đang xác minh..." : "Xác minh email"}
          </button>
        </form>
      )}

      {step === "password" && (
        <form className="space-y-4" onSubmit={handleCompleteSetup}>
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
            <span className="form-label">Xác nhận mật khẩu</span>
            <PasswordField
              autoComplete="new-password"
              name="confirmPassword"
              onChange={(event) => setConfirmPassword(event.currentTarget.value)}
              placeholder="Nhập lại mật khẩu mới"
              required
              value={confirmPassword}
            />
          </label>
          <button className="button-primary w-full" disabled={isWorking} type="submit">
            {isWorking ? "Đang kích hoạt..." : "Hoàn tất thiết lập Admin"}
          </button>
        </form>
      )}

      {errorMessage && (
        <p
          aria-live="polite"
          className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
          role="alert"
        >
          {errorMessage}
        </p>
      )}

      <div className="mt-5 border-t border-slate-200 pt-4">
        <p className="text-xs leading-5 text-slate-500">
          Cấu hình SMTP được lưu trong database. Hãy giới hạn quyền truy cập database và bảo vệ các
          bản sao lưu vì chúng chứa thông tin xác thực email.
        </p>
        <button
          className="text-action-compact mx-auto mt-3 block text-center font-medium text-iuh-blue underline decoration-iuh-blue/30 underline-offset-4 transition hover:text-blue-900 disabled:opacity-60"
          disabled={isWorking}
          onClick={handleResetConfiguration}
          type="button"
        >
          Đặt lại cấu hình kết nối
        </button>
      </div>
    </BrandLayout>
  );
}
