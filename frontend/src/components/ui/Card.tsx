import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`glass-panel rounded-xl p-5 ${
        hoverable ? 'glass-panel-hover transition-all duration-200 cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
