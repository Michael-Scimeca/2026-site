import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function ExperienceContainer({ children, className = '' }: ContainerProps) {
    return (
        <div className={`w-full ${className}`}>
            {children}
        </div>
    );
}
