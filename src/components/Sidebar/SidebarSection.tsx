import React from 'react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => (
  <div className="space-y-4 text-center"> {/* Centrado */}
    <p className="text-sm text-white/70">{title}</p>
    <div className="flex flex-col items-center space-y-1"> {/* Centrado del contenido */}
      {children}
    </div>
  </div>
);

export default SidebarSection;
