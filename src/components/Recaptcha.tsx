import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface RecaptchaProps {
  onVerify: (token: string | null) => void;
  className?: string;
}

const Recaptcha: React.FC<RecaptchaProps> = ({ onVerify, className }) => {
  // Using test site key for development - should be replaced with actual site key via Supabase secrets
  const siteKey = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google's test key
  
  return (
    <div className={className}>
      <ReCAPTCHA
        sitekey={siteKey}
        onChange={onVerify}
        theme="light"
      />
    </div>
  );
};

export default Recaptcha;