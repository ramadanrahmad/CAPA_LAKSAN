import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import LoginPetugasForm from '../components/LoginPetugasForm';
import ForgotPassword from '../components/ForgotPassword';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const [view, setView] = useState('user-login'); // 'user-login' | 'user-signup' | 'forgot' | 'petugas-login'
  const [activeSide, setActiveSide] = useState('right'); // 'left' (petugas) or 'right' (user)
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSelectSide = (side) => {
    setActiveSide(side);
    if (side === 'left') {
      setView('petugas-login');
    } else {
      setView('user-login');
    }
  };

  const renderForm = () => {
    switch (view) {
      case 'user-signup':
        return <SignUpForm onSwitchToLogin={() => setView('user-login')} />;
      case 'forgot':
        return <ForgotPassword onBack={() => setView('user-login')} />;
      case 'petugas-login':
        return <LoginPetugasForm onForgotPassword={() => setView('forgot')} />;
      case 'user-login':
      default:
        return (
          <LoginForm
            onSwitchToSignUp={() => setView('user-signup')}
            onForgotPassword={() => setView('forgot')}
          />
        );
    }
  };

  return (
    <div className="auth-page">
      {/* Animated background orbs */}
      <div className="bg-orbs">
        <div className="bg-orb" />
        <div className="bg-orb" />
        <div className="bg-orb" />
      </div>

      <div className={`auth-container split-layout active-${activeSide}`}>
        
        {/* Left Panel: Petugas */}
        <div 
          className="split-panel left-panel" 
          onClick={() => activeSide !== 'left' && handleSelectSide('left')}
        >
          {activeSide !== 'left' ? (
            <div className="panel-preview">
              <div className="preview-icon">👮</div>
              <h3>Login Petugas</h3>
              <p>Masuk dengan NIP</p>
            </div>
          ) : (
            <div className="auth-form-panel fade-in">
              {renderForm()}
            </div>
          )}
        </div>

        {/* Right Panel: User */}
        <div 
          className="split-panel right-panel" 
          onClick={() => activeSide !== 'right' && handleSelectSide('right')}
        >
          {activeSide !== 'right' ? (
            <div className="panel-preview">
              <div className="preview-icon">👤</div>
              <h3>Login User</h3>
              <p>Masuk dengan Email</p>
            </div>
          ) : (
            <div className="auth-form-panel fade-in">
              {renderForm()}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
