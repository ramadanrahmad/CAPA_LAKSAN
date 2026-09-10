import { useNavigate } from 'react-router-dom';
import ForgotPasswordComponent from '../components/ForgotPassword';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  return (
    <div className="forgot-password-page">
      <div className="bg-orbs">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <div className="forgot-card">
        <ForgotPasswordComponent onBack={() => navigate('/auth')} />
      </div>
    </div>
  );
}
