
import React, { useRef, useEffect, useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onVerify, className }) => {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Using test site key for development - should be replaced with actual site key via environment variable
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
  
  useEffect(() => {
    // Check if reCAPTCHA script is loaded
    const checkRecaptchaLoaded = () => {
      if ((window as any).grecaptcha) {
        setIsLoaded(true);
      } else {
        setTimeout(checkRecaptchaLoaded, 100);
      }
    };
    
    checkRecaptchaLoaded();
  }, []);

  const handleLoad = () => {
    console.log('✅ reCAPTCHA loaded successfully');
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    console.error('❌ reCAPTCHA failed to load');
    setHasError(true);
    setIsLoaded(false);
  };

  const handleChange = (token: string | null) => {
    console.log('🔒 reCAPTCHA verification:', token ? 'success' : 'cleared');
    onVerify(token);
  };

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
        <div className="text-sm text-muted-foreground">
          Loading verification...
        </div>
      </div>
    );
  }
  
  return (
    <div className={className}>
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={siteKey}
        onChange={handleChange}
        onLoad={handleLoad}
        onError={handleError}
        theme="light"
        size="normal"
      />
    </div>
  );
};

export default Recaptcha;
