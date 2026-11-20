import logo from "../assets/khoa-cntt-logo.png";

export default function BrandLogo({ className = "" }) {
  return <img alt="Khoa Công nghệ Thông tin" className={`block h-auto w-full ${className}`} src={logo} />;
}
