import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import BrandLayout from "../components/BrandLayout";
import FormInput from "../components/FormInput";
import PasswordField from "../components/PasswordField";

const initialForm = {
  host: "",
  port: "",
  database: "",
  username: "",
  password: "",
  useSsl: false,
};

function getErrorMessage(error) {
  return typeof error === "string" ? error : "Không thể kết nối hoặc lưu cấu hình database.";
}

export default function DatabaseSetupPage({ onConfigured }) {
  const [form, setForm] = useState(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(event) {
    const { name, value, checked, type } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage("");
    setIsSaving(true);
    try {
      await invoke("configure_database", {
        config: {
          ...form,
          port: Number(form.port),
        },
      });
      const setupRequired = await invoke("get_admin_setup_required");
      setForm((current) => ({ ...current, password: "" }));
      onConfigured(setupRequired);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <BrandLayout>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-iuh-blue">
          Thiết lập ban đầu
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl">
          Cấu hình database
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Nhập thông tin PostgreSQL. Ứng dụng sẽ kiểm tra kết nối trước khi lưu.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8.25rem]">
          <label className="min-w-0">
            <span className="form-label">Máy chủ / hostname</span>
            <FormInput
              autoComplete="off"
              name="host"
              onChange={updateField}
              placeholder="127.0.0.1"
              required
              value={form.host}
            />
          </label>
          <label className="min-w-0">
            <span className="form-label">Cổng</span>
            <FormInput
              max="65535"
              min="1"
              name="port"
              onChange={updateField}
              placeholder="5432"
              required
              type="number"
              value={form.port}
            />
          </label>
        </div>

        <label className="block">
          <span className="form-label">Tên database</span>
          <FormInput
            autoComplete="off"
            name="database"
            onChange={updateField}
            placeholder="quan_ly_so_doan"
            required
            value={form.database}
          />
        </label>

        <label className="block">
          <span className="form-label">Tài khoản database</span>
          <FormInput
            autoComplete="username"
            name="username"
            onChange={updateField}
            placeholder="sa"
            required
            value={form.username}
          />
        </label>

        <label className="block">
          <span className="form-label">Mật khẩu database</span>
          <PasswordField
            autoComplete="new-password"
            name="password"
            onChange={updateField}
            placeholder="sapassword"
            required
            value={form.password}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-iuh-blue/30">
          <input
            checked={form.useSsl}
            className="mt-0.5 size-4 accent-iuh-blue"
            name="useSsl"
            onChange={updateField}
            type="checkbox"
          />
          <span>
            <span className="block text-sm font-semibold text-slate-800">Yêu cầu SSL/TLS</span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              Bật khi máy chủ PostgreSQL yêu cầu kết nối mã hóa. Mặc định tắt cho Compose local.
            </span>
          </span>
        </label>

        {errorMessage && (
          <p
            aria-live="polite"
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <button className="button-primary mt-2 w-full" disabled={isSaving} type="submit">
          {isSaving ? "Đang kiểm tra kết nối..." : "Kiểm tra và lưu cấu hình"}
        </button>
      </form>

      <div className="mt-4 flex gap-3 rounded-xl bg-iuh-sky/20 p-3.5">
        <span aria-hidden="true" className="mt-0.5 text-iuh-blue">
          &#9432;
        </span>
        <p className="text-xs leading-5 text-slate-600">
          Thông tin được lưu trong kho thông tin xác thực của hệ điều hành. Sau khi lưu, ứng dụng
          không hiển thị lại; muốn đổi kết nối, hãy đặt lại từ màn hình đăng nhập.
        </p>
      </div>
    </BrandLayout>
  );
}
