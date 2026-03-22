export const ELD_PRICE_IDS = {
  monthly: 'price_1TDJy9LwWfF7E7ohwEuCZc6F',
  annual: 'price_1TDJyJLwWfF7E7oh35wSnNAS',
} as const;

export const ELD_CHECKOUT_PLANS = {
  monthly: 'eld_monthly',
  annual: 'eld_annual',
} as const;

export const ELD_COUPON = {
  code: 'ELDUPGRADE',
  id: 'jYwbf2RZ',
} as const;

export const ELD_FEATURES = [
  'FMCSA certified ELD logging',
  'Automatic HOS tracking',
  'DOT inspection mode',
  'One tap log transfer',
  '8 day log history',
  'Real time violation alerts',
  'Co-driver support',
  'Safety score tracking',
  'DOT audit package',
] as const;

export const ELD_DISMISS_KEY = 'eld_upgrade_banner_dismissed_until';
export const ELD_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

export const hasActiveEldAddon = (status?: string | null, isActive?: boolean | null) =>
  Boolean(isActive) || status === 'active' || status === 'trialing';
