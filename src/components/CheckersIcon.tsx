import React from 'react';

export const CheckersIcon = ({ className }: { className?: string }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
    >
        <rect x="2" y="2" width="20" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="8" cy="8" r="2" />
        <circle cx="16" cy="16" r="2" />
        <circle cx="16" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="16" r="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
);
