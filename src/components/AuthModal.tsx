import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSiteConfig } from '../context/SiteConfigContext';
import { FlowLogin } from './auth/FlowLogin';
import { FlowSignup } from './auth/FlowSignup';
import { X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    authModalOpen,
    authModalMode,
    closeAuthModal,
    openAuthModal,
    login,
    signup,
    resetPassword,
    loginWithGoogle,
  } = useAuth();
  const { activeConfig } = useSiteConfig();

  if (!authModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Orion-9 Authentication"
    >
      <div className="relative w-full max-w-lg my-auto">
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute right-6 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-full liquid-glass-button text-[var(--orion-text-primary)] shadow-md transition cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-4 h-4" />
        </button>

        {authModalMode === 'signup' ? (
          <FlowSignup
            title={activeConfig.branding.companyName}
            subtitle="Provision your user credentials and get started."
            defaultExpanded={true}
            showSocial={activeConfig.authSettings.allowGoogleAuth}
            onSubmit={async ({ name, username, email, password, terms }) => {
              return await signup(name, username, email, password, terms);
            }}
            onGoogleSignIn={loginWithGoogle}
            onNavigateLogin={() => openAuthModal('login')}
          />
        ) : (
          <FlowLogin
            title={activeConfig.branding.companyName}
            subtitle="Sign in to your supply chain command workspace."
            defaultExpanded={true}
            showSocial={activeConfig.authSettings.allowGoogleAuth}
            showForgot={activeConfig.authSettings.allowPasswordReset}
            onSubmit={async ({ identifier, email, password, remember }) => {
              return await login(identifier || email || '', password, remember);
            }}
            onForgotPassword={(identifier) => resetPassword(identifier)}
            onGoogleSignIn={loginWithGoogle}
            onNavigateSignup={() => openAuthModal('signup')}
          />
        )}
      </div>
    </div>
  );
};
