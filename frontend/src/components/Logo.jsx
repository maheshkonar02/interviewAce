/**
 * InterviewAce Logo Component
 * Multiple logo variants available
 */
import { useId } from 'react';

// Logo Variant 1: Professional with Speech Bubble
export const LogoVariant1 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill={`url(#${gradientId})`}/>
        <path d="M10 12C10 10.8954 10.8954 10 12 10H20C21.1046 10 22 10.8954 22 12V18C22 19.1046 21.1046 20 20 20H16L12 24V20C10.8954 20 10 19.1046 10 18V12Z" fill="white"/>
        <path d="M14 14H18M14 16H18" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round"/>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6366F1"/>
            <stop offset="1" stopColor="#8B5CF6"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Logo Variant 2: Modern with Checkmark/Ace
export const LogoVariant2 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill={`url(#${gradientId})`}/>
        <path d="M12 16L15 19L20 12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
          <linearGradient id={gradientId} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981"/>
            <stop offset="1" stopColor="#059669"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Logo Variant 3: Bold with Microphone
export const LogoVariant3 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill={`url(#${gradientId})`}/>
        <path d="M16 8C14.8954 8 14 8.89543 14 10V16C14 17.1046 14.8954 18 16 18C17.1046 18 18 17.1046 18 16V10C18 8.89543 17.1046 8 16 8Z" fill="white"/>
        <path d="M12 12V16C12 18.2091 13.7909 20 16 20C18.2091 20 20 18.2091 20 16V12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 20V24M13 24H19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EC4899"/>
            <stop offset="1" stopColor="#8B5CF6"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Logo Variant 4: Minimalist with AI Sparkle
export const LogoVariant4 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="14" fill={`url(#${gradientId})`}/>
        <path d="M16 8L17.5 13.5L23 15L17.5 16.5L16 22L14.5 16.5L9 15L14.5 13.5L16 8Z" fill="white"/>
        <circle cx="16" cy="16" r="2" fill="#6366F1"/>
        <defs>
          <linearGradient id={gradientId} x1="16" y1="2" x2="16" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6"/>
            <stop offset="1" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Logo Variant 5: Professional with Shield/Badge
export const LogoVariant5 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 4L22 7V16C22 21.5228 18.5228 26 16 28C13.4772 26 10 21.5228 10 16V7L16 4Z" fill={`url(#${gradientId})`}/>
        <path d="M16 12L18 16L16 20L14 16L16 12Z" fill="white"/>
        <defs>
          <linearGradient id={gradientId} x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F59E0B"/>
            <stop offset="1" stopColor="#EF4444"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Logo Variant 6: Modern with Rocket/Upward Arrow
export const LogoVariant6 = ({ className = "w-8 h-8", textClassName = "text-xl font-bold", textColor = "text-white" }) => {
  const gradientId = useId();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="6" fill={`url(#${gradientId})`}/>
        <path d="M16 8L20 16L16 20L12 16L16 8Z" fill="white"/>
        <path d="M16 20L16 24M12 24H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#06B6D4"/>
            <stop offset="1" stopColor="#3B82F6"/>
          </linearGradient>
        </defs>
      </svg>
      {textClassName && <span className={`${textColor} ${textClassName}`}>InterviewAce</span>}
    </div>
  );
};

// Default Logo (Variant 1 - Professional)
export default function Logo({ variant = 1, className, textClassName, textColor }) {
  const variants = {
    1: LogoVariant1,
    2: LogoVariant2,
    3: LogoVariant3,
    4: LogoVariant4,
    5: LogoVariant5,
    6: LogoVariant6
  };

  const LogoComponent = variants[variant] || LogoVariant1;
  return <LogoComponent className={className} textClassName={textClassName} textColor={textColor} />;
}

