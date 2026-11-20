import BrandLogo from "./BrandLogo";

export default function BrandLayout({ children }) {
  return (
    <main className="flex min-h-[100dvh] items-center justify-center overflow-x-hidden bg-slate-200 px-3 py-4 sm:px-7 sm:py-8 lg:px-10 lg:py-12">
      <div className="mx-auto flex w-full max-w-xl items-center justify-center overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xl shadow-slate-900/20 sm:rounded-[2rem]">
        <section className="flex min-w-0 w-full items-start justify-center px-5 py-8 sm:items-center sm:px-12 sm:py-12 lg:px-14 lg:py-12">
          <div className="w-full min-w-0 max-w-lg">
            <div className="mb-5 w-full max-w-[280px]">
              <BrandLogo />
            </div>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}
