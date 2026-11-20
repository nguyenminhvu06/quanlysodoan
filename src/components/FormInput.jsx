export default function FormInput({ className = "", ...props }) {
  return <input {...props} className={`form-input ${className}`.trim()} />;
}
