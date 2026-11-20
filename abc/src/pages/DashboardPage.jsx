import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import AppLayout from "../components/AppLayout";
import FormInput from "../components/FormInput";
import PasswordField from "../components/PasswordField";

const roleNavigation = {
  ADMIN: [
    { id: "overview", label: "Tổng quan", shortLabel: "OV", subtitle: "Tình hình hệ thống và công việc quản trị." },
    { id: "staff", label: "Cán bộ trường", shortLabel: "CB", subtitle: "Tạo hồ sơ nhân sự trường trước khi cấp tài khoản." },
    { id: "accounts", label: "Tài khoản Bí thư", shortLabel: "TK", subtitle: "Bổ nhiệm Bí thư và quản lý mật khẩu tài khoản." },
  ],
  SECRETARY: [
    { id: "overview", label: "Tổng quan", shortLabel: "OV", subtitle: "Không gian nghiệp vụ của Bí thư Đoàn khoa." },
    { id: "students", label: "Đoàn viên", shortLabel: "ĐV", subtitle: "Quản lý hồ sơ, lớp và trạng thái đoàn viên." },
    { id: "officers", label: "Cán bộ Đoàn", shortLabel: "CB", subtitle: "Quản lý tài khoản Cán bộ Đoàn trong phạm vi được giao." },
    { id: "books", label: "Sổ Đoàn", shortLabel: "SĐ", subtitle: "Theo dõi tiếp nhận, cho mượn và nhận trả sổ." },
    { id: "reports", label: "Tra cứu & báo cáo", shortLabel: "BC", subtitle: "Tra cứu đoàn viên, lịch sử và phiếu quá hạn." },
  ],
  OFFICER: [
    { id: "overview", label: "Tổng quan", shortLabel: "OV", subtitle: "Không gian tác nghiệp văn phòng Đoàn." },
    { id: "intake", label: "Tiếp nhận sổ", shortLabel: "TN", subtitle: "Tạo phiếu tiếp nhận và xác nhận sổ lưu tại văn phòng." },
    { id: "loans", label: "Mượn / trả sổ", shortLabel: "MT", subtitle: "Lập phiếu mượn và xác nhận trả sổ." },
    { id: "lookup", label: "Tra cứu", shortLabel: "TC", subtitle: "Tìm đoàn viên, trạng thái sổ và lịch sử giao dịch." },
  ],
};

const roleLabels = {
  ADMIN: "Quản trị viên",
  SECRETARY: "Bí thư Đoàn khoa",
  OFFICER: "Cán bộ Đoàn",
};

const initialStaffForm = {
  fullName: "",
  email: "",
  phoneNumber: "",
};

function getErrorMessage(error) {
  return typeof error === "string" ? error : "Không thể hoàn tất thao tác. Vui lòng thử lại.";
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-iuh-blue">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function Notice({ children, error = false }) {
  if (!children) {
    return null;
  }
  return (
    <p
      aria-live="polite"
      className={`mb-5 rounded-xl border px-4 py-3 text-sm leading-5 ${
        error
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      role={error ? "alert" : "status"}
    >
      {children}
    </p>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {isActive ? "Đang hoạt động" : status === "DISABLED" ? "Đã khóa" : status}
    </span>
  );
}

function CreateStaffForm({ isSaving, onCreate }) {
  const [form, setForm] = useState(initialStaffForm);

  function updateField(event) {
    const { name, value } = event.currentTarget;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const created = await onCreate(form);
    if (created) {
      setForm(initialStaffForm);
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">Thêm hồ sơ cán bộ trường</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Mã cán bộ được hệ thống tự sinh. Chỉ họ tên là bắt buộc; email và số điện thoại có thể để trống.
        </p>
      </div>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
        <label className="block sm:col-span-2">
          <span className="form-label">Họ và tên</span>
          <FormInput
            autoComplete="name"
            maxLength={150}
            name="fullName"
            onChange={updateField}
            placeholder="Nhập họ và tên cán bộ"
            required
            value={form.fullName}
          />
        </label>
        <label className="block">
          <span className="form-label">Email <span className="font-normal text-slate-400">(không bắt buộc)</span></span>
          <FormInput
            autoComplete="email"
            maxLength={254}
            name="email"
            onChange={updateField}
            placeholder="email@iuh.edu.vn"
            type="email"
            value={form.email}
          />
        </label>
        <label className="block">
          <span className="form-label">Số điện thoại <span className="font-normal text-slate-400">(không bắt buộc)</span></span>
          <FormInput
            autoComplete="tel"
            maxLength={20}
            name="phoneNumber"
            onChange={updateField}
            placeholder="Nhập số điện thoại"
            value={form.phoneNumber}
          />
        </label>
        <div className="sm:col-span-2">
          <button className="button-primary w-full sm:w-auto" disabled={isSaving} type="submit">
            {isSaving ? "Đang lưu hồ sơ..." : "Tạo hồ sơ cán bộ"}
          </button>
        </div>
      </form>
    </section>
  );
}

function StaffDirectory({ profiles, isLoading }) {
  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h3 className="font-bold text-slate-900">Danh sách cán bộ trường</h3>
          <p className="mt-1 text-xs text-slate-500">{profiles.length} hồ sơ</p>
        </div>
        {isLoading && <span className="text-xs font-medium text-slate-400">Đang tải...</span>}
      </div>
      {profiles.length === 0 ? (
        <div className="p-8 text-center">
          <p className="font-semibold text-slate-700">Chưa có hồ sơ cán bộ</p>
          <p className="mt-1 text-sm text-slate-500">Tạo hồ sơ trước khi cấp tài khoản Bí thư.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 font-bold">Mã cán bộ</th>
                <th className="px-5 py-3 font-bold">Họ tên</th>
                <th className="px-5 py-3 font-bold">Liên hệ</th>
                <th className="px-5 py-3 font-bold">Tài khoản</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((profile) => (
                <tr key={profile.staffCode}>
                  <td className="px-5 py-4 font-mono text-xs font-bold text-iuh-blue">
                    {profile.staffCode}
                  </td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{profile.fullName}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="block">{profile.email || "—"}</span>
                    <span className="mt-1 block text-xs text-slate-400">
                      {profile.phoneNumber || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {profile.accountUsername ? (
                      <>
                        <span className="block font-semibold text-slate-700">
                          {profile.accountUsername}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {profile.accountRole}
                        </span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Chưa cấp</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function StaffManagement({ profiles, isLoading, isSaving, message, error, onCreate }) {
  return (
    <>
      <SectionHeading
        description="Hồ sơ nhân sự trường được lưu độc lập với hồ sơ sinh viên. Mã cán bộ nội bộ tự sinh và không nhập thủ công."
        eyebrow="Quản trị nhân sự"
        title="Cán bộ trường"
      />
      <Notice error={error}>{error || message}</Notice>
      <CreateStaffForm isSaving={isSaving} onCreate={onCreate} />
      <StaffDirectory isLoading={isLoading} profiles={profiles} />
    </>
  );
}

function SecretaryAssignment({ profiles, isSaving, onAppoint, selectedStaffCode, setSelectedStaffCode }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const selectedProfile = profiles.find((profile) => profile.staffCode === selectedStaffCode);

  async function handleSubmit(event) {
    event.preventDefault();
    const assigned = await onAppoint({ staffCode: selectedStaffCode, username, password });
    if (assigned) {
      setUsername("");
      setPassword("");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-slate-900">Bổ nhiệm Bí thư Đoàn khoa</h3>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Chỉ hồ sơ cán bộ đã tạo mới xuất hiện ở đây. Bổ nhiệm người mới sẽ khóa tài khoản Bí thư cũ.
        </p>
      </div>
      {profiles.length === 0 ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm leading-5 text-amber-800">
          Chưa có hồ sơ cán bộ. Hãy tạo hồ sơ trong mục Cán bộ trường trước.
        </p>
      ) : (
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block sm:col-span-2">
            <span className="form-label">Chọn cán bộ</span>
            <select
              className="form-input"
              onChange={(event) => setSelectedStaffCode(event.currentTarget.value)}
              required
              value={selectedStaffCode}
            >
              <option value="">Chọn hồ sơ cán bộ</option>
              {profiles.map((profile) => {
                const isCurrentSecretary =
                  profile.accountRole === "SECRETARY" && profile.accountStatus === "ACTIVE";
                return (
                  <option disabled={isCurrentSecretary} key={profile.staffCode} value={profile.staffCode}>
                    {profile.staffCode} — {profile.fullName}
                    {isCurrentSecretary ? " (Bí thư hiện tại)" : ""}
                  </option>
                );
              })}
            </select>
          </label>
          {selectedProfile?.accountUsername && (
            <p className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-800 sm:col-span-2">
              Hồ sơ này đã có tài khoản <strong>{selectedProfile.accountUsername}</strong>. Khi bổ nhiệm,
              hệ thống sẽ cập nhật username/mật khẩu và chuyển tài khoản sang role SECRETARY.
            </p>
          )}
          <label className="block">
            <span className="form-label">Username đăng nhập</span>
            <FormInput
              autoComplete="username"
              maxLength={100}
              onChange={(event) => setUsername(event.currentTarget.value)}
              placeholder="Ví dụ: canbo02"
              required
              value={username}
            />
          </label>
          <label className="block">
            <span className="form-label">Mật khẩu ban đầu</span>
            <PasswordField
              autoComplete="new-password"
              name="secretaryPassword"
              onChange={(event) => setPassword(event.currentTarget.value)}
              placeholder="Ít nhất 12 ký tự, có hoa/thường/số/ký tự đặc biệt"
              required
              value={password}
            />
          </label>
          <div className="sm:col-span-2">
            <button
              className="button-primary w-full sm:w-auto"
              disabled={isSaving || profiles.length === 0}
              type="submit"
            >
              {isSaving ? "Đang cập nhật..." : "Bổ nhiệm và cấp tài khoản"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function AccountPasswordEditor({ account, actorUsername, onUpdated }) {
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");
    setIsSaving(true);
    try {
      await invoke("set_managed_account_password", {
        actorUsername,
        accountId: account.id,
        newPassword: password,
      });
      setPassword("");
      setMessage("Đã cập nhật mật khẩu.");
      await onUpdated();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="mt-4 border-t border-slate-100 pt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="form-label">Đặt mật khẩu mới</span>
          <PasswordField
            autoComplete="new-password"
            name={`password-${account.id}`}
            onChange={(event) => setPassword(event.currentTarget.value)}
            placeholder="Ít nhất 12 ký tự, có hoa/thường/số/ký tự đặc biệt"
            required
            value={password}
          />
        </label>
        <button className="button-secondary" disabled={isSaving} type="submit">
          {isSaving ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </div>
      {message && <p className="mt-2 text-xs font-medium text-emerald-700">{message}</p>}
      {error && (
        <p aria-live="polite" className="mt-2 text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

function AccountManagement({
  accounts,
  actorUsername,
  isLoading,
  isSaving,
  message,
  error,
  onAppoint,
  onRefresh,
  profiles,
  selectedStaffCode,
  setSelectedStaffCode,
}) {
  const activeSecretary = accounts.find(
    (account) => account.role === "SECRETARY" && account.status === "ACTIVE",
  );

  return (
    <>
      <SectionHeading
        description="Tài khoản luôn gắn với hồ sơ người. Admin có thể cấp role Bí thư và đặt lại mật khẩu cho tài khoản nghiệp vụ, không thao tác trên tài khoản Admin của chính mình."
        eyebrow="Quản lý truy cập"
        title="Tài khoản và phân quyền"
      />
      <Notice error={error}>{error || message}</Notice>
      <div className="mb-6 rounded-2xl border border-iuh-blue/15 bg-gradient-to-r from-iuh-blue to-blue-800 p-5 text-white shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-100">
          Bí thư Đoàn khoa hiện tại
        </p>
        {activeSecretary ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xl font-extrabold">{activeSecretary.personName || "Cán bộ trường"}</p>
              <p className="mt-1 text-sm text-blue-100">
                {activeSecretary.username} · {activeSecretary.personCode}
              </p>
            </div>
            <StatusBadge status={activeSecretary.status} />
          </div>
        ) : (
          <p className="mt-3 text-sm text-blue-100">Chưa bổ nhiệm Bí thư.</p>
        )}
      </div>

      <SecretaryAssignment
        isSaving={isSaving}
        onAppoint={onAppoint}
        profiles={profiles}
        selectedStaffCode={selectedStaffCode}
        setSelectedStaffCode={setSelectedStaffCode}
      />

      <section className="mt-6">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900">Tài khoản ngoài Admin</h3>
            <p className="mt-1 text-sm text-slate-500">
              Có thể đặt lại mật khẩu cho mọi role nghiệp vụ; mật khẩu không hiển thị sau khi lưu.
            </p>
          </div>
          {isLoading && <span className="shrink-0 text-xs text-slate-400">Đang tải...</span>}
        </div>
        {accounts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <p className="font-semibold text-slate-700">Chưa có tài khoản nghiệp vụ</p>
            <p className="mt-1 text-sm text-slate-500">
              Tạo hồ sơ cán bộ trước, sau đó bổ nhiệm Bí thư để cấp tài khoản đầu tiên.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                key={account.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900">{account.username}</h4>
                      <span className="rounded-full bg-iuh-blue/10 px-2.5 py-1 text-xs font-bold text-iuh-blue">
                        {roleLabels[account.role] || account.role}
                      </span>
                      <StatusBadge status={account.status} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {account.personName || "Chưa liên kết hồ sơ"}
                      {account.personCode ? ` · ${account.personCode}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {account.personType === "STAFF" ? "Nhân sự trường" : "Sinh viên"}
                    </p>
                  </div>
                </div>
                <AccountPasswordEditor
                  account={account}
                  actorUsername={actorUsername}
                  onUpdated={onRefresh}
                />
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function AdminOverview({ accounts, onNavigate, profiles }) {
  const activeSecretary = accounts.find(
    (account) => account.role === "SECRETARY" && account.status === "ACTIVE",
  );
  const activeAccounts = accounts.filter((account) => account.status === "ACTIVE").length;
  const metrics = [
    { label: "Hồ sơ cán bộ trường", value: profiles.length, action: "staff" },
    { label: "Tài khoản nghiệp vụ", value: activeAccounts, action: "accounts" },
    { label: "Bí thư hiện tại", value: activeSecretary?.personName || "Chưa bổ nhiệm", action: "accounts" },
  ];

  return (
    <>
      <SectionHeading
        description="Quản lý nhân sự và quyền truy cập của hệ thống Sổ Đoàn Viên."
        eyebrow="Không gian quản trị"
        title="Tổng quan"
      />
      <div className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <button
            className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-iuh-blue/30 hover:shadow-md"
            key={metric.label}
            onClick={() => onNavigate(metric.action)}
            type="button"
          >
            <span className="text-sm font-semibold text-slate-500">{metric.label}</span>
            <span className="mt-4 block truncate text-2xl font-extrabold text-slate-900">
              {metric.value}
            </span>
          </button>
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-iuh-blue">
          Quy trình khởi tạo quyền
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <button
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-iuh-blue/30 hover:bg-slate-50"
            onClick={() => onNavigate("staff")}
            type="button"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-iuh-blue/10 text-xs font-extrabold text-iuh-blue">
              01
            </span>
            <span className="mt-3 block font-bold text-slate-800">Tạo hồ sơ cán bộ trường</span>
            <span className="mt-1 block text-sm leading-5 text-slate-500">
              Lưu thông tin cán bộ, hệ thống tự sinh mã nội bộ.
            </span>
          </button>
          <button
            className="rounded-xl border border-slate-200 p-4 text-left transition hover:border-iuh-blue/30 hover:bg-slate-50"
            onClick={() => onNavigate("accounts")}
            type="button"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-iuh-blue/10 text-xs font-extrabold text-iuh-blue">
              02
            </span>
            <span className="mt-3 block font-bold text-slate-800">Cấp tài khoản Bí thư</span>
            <span className="mt-1 block text-sm leading-5 text-slate-500">
              Chọn cán bộ đã có hồ sơ, đặt username và mật khẩu ban đầu.
            </span>
          </button>
        </div>
      </section>
    </>
  );
}

function RolePlaceholder({ role, section }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-iuh-blue/10 text-sm font-extrabold text-iuh-blue">
        {section.shortLabel}
      </div>
      <h2 className="mt-5 text-xl font-extrabold text-slate-900">{section.label}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{section.subtitle}</p>
      <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        Giao diện đã phân tách theo role <strong>{roleLabels[role] || role}</strong>. Nghiệp vụ này sẽ
        được triển khai theo SRS sau module quản lý tài khoản và nhân sự.
      </p>
    </section>
  );
}

export default function DashboardPage({ user, onLogout }) {
  const navigation = roleNavigation[user.role] || roleNavigation.OFFICER;
  const [activeSection, setActiveSection] = useState("overview");
  const [staffProfiles, setStaffProfiles] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedStaffCode, setSelectedStaffCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [operationError, setOperationError] = useState("");
  const [operationMessage, setOperationMessage] = useState("");
  const isAdmin = user.role === "ADMIN";

  const loadAdminData = useCallback(async () => {
    if (!isAdmin) {
      return;
    }
    setIsLoading(true);
    setLoadError("");
    try {
      const [profiles, managedAccounts] = await Promise.all([
        invoke("list_staff_profiles", { actorUsername: user.username }),
        invoke("list_managed_accounts", { actorUsername: user.username }),
      ]);
      setStaffProfiles(profiles);
      setAccounts(managedAccounts);
      setSelectedStaffCode((current) =>
        profiles.some(
          (profile) =>
            profile.staffCode === current &&
            (profile.accountRole !== "SECRETARY" || profile.accountStatus !== "ACTIVE"),
        )
          ? current
          : profiles.find(
              (profile) =>
                profile.accountRole !== "SECRETARY" || profile.accountStatus !== "ACTIVE",
            )?.staffCode ?? "",
      );
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, user.username]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const createStaff = async (form) => {
    setOperationError("");
    setOperationMessage("");
    setIsSaving(true);
    try {
      const profile = await invoke("create_staff_profile", {
        actorUsername: user.username,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
      });
      setSelectedStaffCode(profile.staffCode);
      setOperationMessage(
        `Đã tạo hồ sơ ${profile.staffCode}. Tiếp theo có thể cấp tài khoản Bí thư trong mục Tài khoản.`,
      );
      await loadAdminData();
      return profile;
    } catch (error) {
      setOperationError(getErrorMessage(error));
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const appointSecretary = async ({ staffCode, username, password }) => {
    setOperationError("");
    setOperationMessage("");
    setIsSaving(true);
    try {
      await invoke("appoint_secretary", {
        actorUsername: user.username,
        staffCode,
        username,
        password,
      });
      setOperationMessage("Đã bổ nhiệm Bí thư. Tài khoản Bí thư cũ đã được khóa.");
      await loadAdminData();
      return true;
    } catch (error) {
      setOperationError(getErrorMessage(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const activePage = navigation.find((item) => item.id === activeSection) || navigation[0];
  const roleTitle = roleLabels[user.role] || user.role;

  return (
    <AppLayout
      activeSection={activeSection}
      navigation={navigation}
      onLogout={onLogout}
      onNavigate={(section) => {
        setOperationError("");
        setOperationMessage("");
        setActiveSection(section);
      }}
      pageTitle={activePage.label}
      subtitle={activePage.subtitle}
      user={user}
    >
      {loadError && <Notice error>{loadError}</Notice>}
      {isAdmin ? (
        <>
          {activeSection === "overview" && (
            <AdminOverview
              accounts={accounts}
              onNavigate={setActiveSection}
              profiles={staffProfiles}
            />
          )}
          {activeSection === "staff" && (
            <StaffManagement
              error={operationError}
              isLoading={isLoading}
              isSaving={isSaving}
              message={operationMessage}
              onCreate={createStaff}
              profiles={staffProfiles}
            />
          )}
          {activeSection === "accounts" && (
            <AccountManagement
              accounts={accounts}
              actorUsername={user.username}
              error={operationError}
              isLoading={isLoading}
              isSaving={isSaving}
              message={operationMessage}
              onAppoint={appointSecretary}
              onRefresh={loadAdminData}
              profiles={staffProfiles}
              selectedStaffCode={selectedStaffCode}
              setSelectedStaffCode={setSelectedStaffCode}
            />
          )}
        </>
      ) : activeSection === "overview" ? (
        <>
          <SectionHeading
            description={`Chào ${user.username}. Các mục thao tác hiển thị theo quyền ${roleTitle}.`}
            eyebrow="Không gian nghiệp vụ"
            title={`Xin chào, ${user.username}`}
          />
          <div className="grid gap-4 md:grid-cols-2">
            {navigation
              .filter((item) => item.id !== "overview")
              .map((item) => (
                <button
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-iuh-blue/30 hover:shadow-md"
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  type="button"
                >
                  <span className="flex size-9 items-center justify-center rounded-lg bg-iuh-blue/10 text-xs font-extrabold text-iuh-blue">
                    {item.shortLabel}
                  </span>
                  <span className="mt-3 block font-bold text-slate-800">{item.label}</span>
                  <span className="mt-1 block text-sm leading-5 text-slate-500">{item.subtitle}</span>
                </button>
              ))}
          </div>
        </>
      ) : (
        <RolePlaceholder role={user.role} section={activePage} />
      )}
    </AppLayout>
  );
}
