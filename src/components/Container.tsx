import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
}

export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`px-8 ${className}`}>
            {children}
        </div>
    );
}
