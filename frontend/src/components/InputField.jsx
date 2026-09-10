import { useState } from 'react';

export default function InputField({
  id,
  label,
  type = 'text',
  icon,
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="input-group">
      {label && <label htmlFor={id}>{label}</label>}
      <div className="input-wrapper">
        {icon && <span className="input-icon">{icon}</span>}
        <input
          id={id}
          type={inputType}
          className={`input-field${error ? ' error' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          style={!icon ? { paddingLeft: '14px' } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        )}
      </div>
      {error && (
        <span className="input-error">
          <span>⚠</span> {error}
        </span>
      )}
    </div>
  );
}
