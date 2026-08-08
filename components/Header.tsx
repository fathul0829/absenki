import React from 'react';

interface HeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export default function Header({ title, subtitle, rightContent }: HeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        {subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
      </div>
      {rightContent && (
        <div className="flex items-center gap-3">
          {rightContent}
        </div>
      )}
    </header>
  );
}
