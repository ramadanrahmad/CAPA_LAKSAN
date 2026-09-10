import { getPasswordStrength } from '../utils/validation';

export default function PasswordStrength({ password }) {
  const { score, label, level } = getPasswordStrength(password);

  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bars">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`strength-bar${i <= score ? ` active ${level}` : ''}`}
          />
        ))}
      </div>
      {label && <span className={`strength-text ${level}`}>{label}</span>}
    </div>
  );
}
