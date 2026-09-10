import { useParams, useNavigate } from 'react-router-dom';
import ResetPasswordComponent from '../components/ResetPassword';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  return (
    <div className="reset-password-page">
      <div className="bg-orbs">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <div className="reset-card">
        <ResetPasswordComponent
          token={token}
          onSuccess={() => navigate('/auth')}
        />
      </div>
    </div>
  );
}
