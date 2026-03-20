import { useLocation } from 'react-router-dom';
import { PageContextInfo, QuickReply } from './types';

const defaultQuickReplies: QuickReply[] = [
  { label: 'IFTA Help', emoji: '📋', message: 'What is IFTA and how does it work?' },
  { label: 'My Deadline', emoji: '📅', message: 'When is my next IFTA filing deadline?' },
  { label: 'Calculate Tax', emoji: '💰', message: 'How much IFTA tax do I owe this quarter?' },
  { label: 'Scan Help', emoji: '📷', message: 'How do I scan a fuel receipt?' },
];

const pageContextMap: Record<string, (name: string) => PageContextInfo> = {
  '/scan-receipt': (name) => ({
    greeting: `Ready to scan a receipt, ${name}? Point your camera at the fuel receipt and hold steady. Need help? Just ask! 📷`,
    quickReplies: [
      { label: 'How to scan', emoji: '📷', message: 'How do I scan a fuel receipt?' },
      { label: 'Missing receipts', emoji: '📄', message: "I'm missing some fuel receipts" },
      { label: 'Receipt tips', emoji: '💡', message: 'Tips for getting a clear receipt scan?' },
      { label: 'IFTA Help', emoji: '📋', message: 'How do receipts affect my IFTA filing?' },
    ],
  }),
  '/ifta-reports': (name) => ({
    greeting: `Working on your IFTA report, ${name}? I can help you understand your tax calculations or walk you through the filing process! 📋`,
    quickReplies: [
      { label: 'Filing steps', emoji: '📋', message: 'Walk me through the IFTA filing process' },
      { label: 'Tax breakdown', emoji: '💰', message: 'Can you break down my tax by state?' },
      { label: 'Download report', emoji: '📥', message: 'How do I download my IFTA report?' },
      { label: 'My deadline', emoji: '📅', message: 'When is my IFTA report due?' },
    ],
  }),
  '/dashboard': (name) => ({
    greeting: `Hi ${name}! 🚛 I'm your IFTA assistant. Want me to check if your quarterly report is ready to file?`,
    quickReplies: defaultQuickReplies,
  }),
  '/onboarding': (name) => ({
    greeting: `Welcome to TrueTrucker, ${name}! 👋 I'm here to help you get set up. What questions do you have?`,
    quickReplies: [
      { label: 'Getting started', emoji: '🚀', message: 'How do I get started with IFTA tracking?' },
      { label: 'Add a truck', emoji: '🚛', message: 'How do I add my truck?' },
      { label: 'What is IFTA?', emoji: '📋', message: 'What is IFTA and do I need it?' },
      { label: 'App features', emoji: '⭐', message: 'What can this app do for me?' },
    ],
  }),
  '/pricing': (name) => ({
    greeting: `Thinking about upgrading, ${name}? I can help you pick the right plan for your operation. How many trucks do you have? 🚛`,
    quickReplies: [
      { label: 'Compare plans', emoji: '📊', message: 'What are the differences between plans?' },
      { label: 'Best for me', emoji: '🎯', message: "Which plan is best for my operation?" },
      { label: 'Free trial', emoji: '🆓', message: 'How does the free trial work?' },
      { label: 'Fleet pricing', emoji: '🚛', message: 'What about fleet/enterprise pricing?' },
    ],
  }),
  '/bol-management': (name) => ({
    greeting: `Need to manage your Bills of Lading, ${name}? I can help with scanning and organizing your BOLs! 📄`,
    quickReplies: [
      { label: 'Scan a BOL', emoji: '📷', message: 'How do I scan a BOL?' },
      { label: 'BOL status', emoji: '📋', message: 'How do I track BOL status?' },
      { label: 'Missing BOL', emoji: '❓', message: "What if I'm missing a BOL?" },
      { label: 'IFTA Help', emoji: '📋', message: 'How do BOLs relate to IFTA?' },
    ],
  }),
  '/trips': (name) => ({
    greeting: `Managing your trips, ${name}? I can help with trip logging and mileage tracking! 🗺️`,
    quickReplies: [
      { label: 'Add a trip', emoji: '➕', message: 'How do I add a new trip?' },
      { label: 'Mileage tracking', emoji: '📍', message: 'How is my mileage tracked?' },
      { label: 'State miles', emoji: '🗺️', message: 'How do I see miles by state?' },
      { label: 'IFTA Help', emoji: '📋', message: 'How do trips affect my IFTA report?' },
    ],
  }),
  '/fleet-dashboard': (name) => ({
    greeting: `Welcome to your Fleet Dashboard, ${name}! I can help you manage your drivers and fleet operations. 🚛`,
    quickReplies: [
      { label: 'Add a driver', emoji: '👤', message: 'How do I add a driver to my fleet?' },
      { label: 'Invite code', emoji: '🔑', message: "What's my fleet invite code?" },
      { label: 'Fleet reports', emoji: '📊', message: 'How do I view fleet-wide reports?' },
      { label: 'Driver status', emoji: '📋', message: 'How do I check driver compliance?' },
    ],
  }),
  '/mileage-tracker': (name) => ({
    greeting: `Tracking your miles, ${name}? I can help with GPS tracking and manual entries! 📍`,
    quickReplies: [
      { label: 'GPS tracking', emoji: '📍', message: 'How does GPS mileage tracking work?' },
      { label: 'Manual entry', emoji: '✏️', message: 'How do I enter miles manually?' },
      { label: 'State breakdown', emoji: '🗺️', message: 'Show me my miles by state' },
      { label: 'IFTA Help', emoji: '📋', message: 'How does mileage affect my IFTA?' },
    ],
  }),
};

export function usePageContext(userName: string): PageContextInfo {
  const location = useLocation();
  const path = location.pathname;

  const contextFn = pageContextMap[path];
  if (contextFn) return contextFn(userName || 'Driver');

  return {
    greeting: `Hi ${userName || 'Driver'}! 👋 I'm your IFTA assistant. I can help you with filing questions, mileage tracking, BOL scanning, tax calculations, and more. What do you need help with?`,
    quickReplies: defaultQuickReplies,
  };
}
