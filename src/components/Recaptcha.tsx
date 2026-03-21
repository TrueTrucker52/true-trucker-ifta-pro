import React, { useRef, useEffect, useState, useCallback } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

let recaptchaScriptLoaded = false;
let recaptchaScriptLoading = false;
const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim();

function loadRecaptchaScript(): Promise<void> {
  if (!siteKey) return Promise.resolve();
  if (recaptchaScriptLoaded) return Promise.resolve();
  if (recaptchaScriptLoading) {
    return new Promise((resolve) => {
      const check = () => {
        if ((window as any).grecaptcha) { recaptchaScriptLoaded = true; resolve(); }
        else setTimeout(check, 100);
      };
      check();
    });
  }
  recaptchaScriptLoading = true;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => { recaptchaScriptLoaded = true; resolve(); };
    script.onerror = () => {
      recaptchaScriptLoading = false;
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onVerify, className }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoaded, setIsLoaded] = useState(!siteKey || recaptchaScriptLoaded);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!siteKey) {
      onVerify(null);
    }
  }, [onVerify]);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    loadRecaptchaScript()
      .then(() => { if (!cancelled) setIsLoaded(true); })
      .catch(() => { if (!cancelled) setHasError(true); });
    return () => { cancelled = true; };
  }, []);

  const handleChange = useCallback((token: string | null) => {
    onVerify(token);
  }, [onVerify]);

  if (!siteKey) {
    return null;
  }

  if (hasError) {
    return (
      <div className={`${className} text-center p-4`}>
        <div className="text-sm text-muted-foreground">
          reCAPTCHA failed to load. Please refresh the page and try again.
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${className} text-center p-4`}>
        <div className="text-sm text-muted-foreground">Loading verification...</div>
      </div>
    );
  }

  return (
    <div className={className}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        theme="light"
        size="normal"
      />
    </div>
  );
};

export default Recaptcha;
