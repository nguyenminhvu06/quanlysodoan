import BrandLogo from "./BrandLogo";

const roleLabels = {
  ADMIN: "Quản trị viên",
  SECRETARY: "Bí thư Đoàn khoa",
  OFFICER: "Cán bộ Đoàn",
};

function Navigation({ items, activeSection, onNavigate, compact = false }) {
  return (
    <nav className={compact ? "flex gap-2 overflow-x-auto px-4 pb-3 lg:hidden" : "space-y-1 px-3"}>
      {items.map((item) => (
        <button
          className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
            activeSection === item.id
              ? "bg-iuh-blue/10 text-iuh-blue"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          } ${compact ? "whitespace-nowrap" : "w-full"}`}
          key={item.id}
          onClick={() => onNavigate(item.id)}
          type="button"
        >
          <span
            aria-hidden="true"
            className={`flex size-8 items-center justify-center rounded-lg text-xs font-bold ${
              activeSection === item.id ? "bg-white text-iuh-blue" : "bg-slate-100 text-slate-500"
            }`}
          >
            {item.shortLabel}
          </span>
          {item.label}
        </button>
      ))}
    </nav>
  );
}

export default function AppLayout({
  activeSection,
  children,
  navigation,
  onLogout,
  onNavigate,
  pageTitle,
  subtitle,
  user,
}) {
  const roleLabel = roleLabels[user.role] ?? user.role;

  return (
    <div className="h-[100dvh] overflow-hidden bg-slate-50 text-slate-900">
      <div className="h-full lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
        <aside className="hidden h-[100dvh] overflow-hidden border-r border-slate-200 bg-white lg:flex lg:flex-col">
          <div className="border-b border-slate-100 px-6 py-6">
            <div className="max-w-[210px]">
              <BrandLogo />
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-iuh-blue">
              Sổ Đoàn Viên
            </p>
            <p className="mt-1 text-xs text-slate-500">Không gian làm việc</p>
          </div>

          <div className="px-5 pb-2 pt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Menu chính
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <Navigation
              activeSection={activeSection}
              items={navigation}
              onNavigate={onNavigate}
            />
          </div>

          <div className="mt-auto border-t border-slate-100 p-4">
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="truncate text-sm font-bold text-slate-800">{user.username}</p>
              <p className="mt-1 text-xs text-slate-500">{roleLabel}</p>
            </div>
            <button className="button-secondary w-full" onClick={onLogout} type="button">
              Đăng xuất
            </button>
          </div>
        </aside>

        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          <header className="shrink-0 border-b border-slate-200 bg-white">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-7 lg:px-9">
              <div className="min-w-0">
                <div className="mb-2 w-36 lg:hidden">
                  <BrandLogo />
                </div>
                <h1 className="truncate text-xl font-extrabold text-slate-900 sm:text-2xl">
                  {pageTitle}
                </h1>
                <p className="mt-1 hidden text-sm text-slate-500 sm:block">{subtitle}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <div className="hidden text-right sm:block lg:hidden">
                  <p className="text-sm font-bold text-slate-800">{user.username}</p>
                  <p className="text-xs text-slate-500">{roleLabel}</p>
                </div>
                <span className="hidden rounded-full bg-iuh-blue/10 px-3 py-1.5 text-xs font-bold text-iuh-blue lg:inline-flex">
                  {roleLabel}
                </span>
                <button
                  className="button-secondary min-h-10 px-3 py-2 text-xs lg:hidden"
                  onClick={onLogout}
                  type="button"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
            <Navigation
              activeSection={activeSection}
              compact
              items={navigation}
              onNavigate={onNavigate}
            />
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-7 lg:p-9">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
