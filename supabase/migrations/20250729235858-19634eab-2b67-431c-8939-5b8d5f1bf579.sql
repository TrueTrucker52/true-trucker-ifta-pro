-- Disable captcha verification in auth settings
UPDATE auth.config SET 
  security_captcha_enabled = false, 
  security_captcha_provider = NULL,
  security_captcha_secret = NULL
WHERE true;