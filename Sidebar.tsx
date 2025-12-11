import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, MapPin, BarChart3, PlusCircle } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
    }`;

  return (
    <aside className="w-64 bg-gray-900 text-white flex-shrink-0 flex flex-col h-screen fixed left-0 top-0 overflow-y-auto z-50 no-print">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold text-lg">D</div>
          <span className="text-xl font-bold tracking-tight">Docflow</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Gestão Inteligente</p>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/" className={navClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/documents" className={navClass}>
          <FileText size={20} />
          Documentos
        </NavLink>
        <NavLink to="/documents/new" className={navClass}>
          <PlusCircle size={20} />
          Novo Documento
        </NavLink>
        <NavLink to="/locations" className={navClass}>
          <MapPin size={20} />
          Locais
        </NavLink>
        <NavLink to="/reports" className={navClass}>
          <BarChart3 size={20} />
          Relatórios
        </NavLink>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs">US</div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Usuário Admin</span>
            <span className="text-xs text-gray-500">admin@empresa.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};