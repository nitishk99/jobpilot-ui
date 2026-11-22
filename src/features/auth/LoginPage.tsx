import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Check, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { getGoogleOAuthUrl } from './auth.api';

export function LoginPage() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const oauthError = params.get('error');
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  function startGoogleLogin() {
    setError('');
    setStarting(true);
    try {
      window.location.assign(getGoogleOAuthUrl());
    } catch {
      setStarting(false);
      setError('Unable to start Google sign-in. Check your API configuration and try again.');
    }
  }

  return (
    <main className="auth-experience">
      <section className="auth-hero">
        <div className="auth-brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <strong>jobpilot</strong>
        </div>
        <div className="auth-hero-copy">
          <span className="hero-kicker"><Sparkles size={14} /> Your job search, organized</span>
          <h1>Turn your inbox into a clear career plan.</h1>
          <p>JobPilot connects hiring emails to every application, so you always know what happened and what comes next.</p>
        </div>
        <div className="hero-preview" aria-hidden="true">
          <div className="preview-header">
            <span className="preview-logo"><BriefcaseBusiness size={17} /></span>
            <div><strong>Your applications</strong><span>Everything in one place</span></div>
          </div>
          <div className="preview-row">
            <span className="preview-company">N</span>
            <div><strong>Product Designer</strong><span>Northstar · Interview</span></div>
            <span className="preview-status">Scheduled</span>
          </div>
          <div className="preview-row muted">
            <span className="preview-company">V</span>
            <div><strong>Frontend Engineer</strong><span>Vertex · Application</span></div>
            <span className="preview-mail"><Mail size={14} /> 6</span>
          </div>
        </div>
        <div className="hero-proof"><span><Check size={15} /> Private by design</span><span><Check size={15} /> Gmail connected</span></div>
      </section>

      <section className="auth-form-panel">
        <div className="login-card">
          <span className="login-icon"><BriefcaseBusiness size={22} /></span>
          <span className="eyebrow">WELCOME TO JOBPILOT</span>
          <h2>Sign in to your workspace</h2>
          <p className="login-copy">Use your Google account to securely access your applications and email timeline.</p>
          <button className="google-button" onClick={startGoogleLogin} disabled={starting}>
            <span className="google-g" aria-hidden="true">G</span>
            <span>{starting ? 'Opening Google…' : 'Continue with Google'}</span>
            <ArrowRight size={17} />
          </button>
          {(error || oauthError) && <div className="inline-alert" role="alert">{error || 'Google sign-in was not completed. Please try again.'}</div>}
          <div className="privacy-note"><ShieldCheck size={17} /><span>Secure sign-in. Your Google password is never shared with JobPilot.</span></div>
        </div>
        <p className="auth-footer">Built for a focused, calmer job search.</p>
      </section>
    </main>
  );
}
