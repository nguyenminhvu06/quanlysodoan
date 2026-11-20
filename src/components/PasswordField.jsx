import { useState } from "react";
import FormInput from "./FormInput";

export default function PasswordField({ autoComplete, name, onChange, placeholder, required, value }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <FormInput
        autoComplete={autoComplete}
        className="pr-12"
        name={name}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        type={isVisible ? "text" : "password"}
        value={value}
      />
      <button
        aria-label={isVisible ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
        aria-pressed={isVisible}
        className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-iuh-blue"
        onClick={() => setIsVisible((visible) => !visible)}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z" />
          <circle cx="12" cy="12" r="3" />
          {isVisible && <path d="m4 4 16 16" />}
        </svg>
      </button>
    </div>
  );
}
