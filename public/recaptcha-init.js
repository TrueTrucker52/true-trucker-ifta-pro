
// Initialize reCAPTCHA
(function() {
  if (typeof window !== 'undefined') {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    
    script.onload = function() {
      console.log('✅ reCAPTCHA script loaded');
    };
    
    script.onerror = function() {
      console.error('❌ Failed to load reCAPTCHA script');
    };
    
    document.head.appendChild(script);
  }
})();
