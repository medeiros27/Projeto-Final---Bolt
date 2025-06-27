import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  UserCheck, 
  DollarSign, 
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Zap,
  Target,
  CreditCard,
  Calendar,
  RotateCcw,
  History
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { 
        name: user?.role === 'admin' ? 'Platform Overview' : 'Dashboard', 
        href: '/dashboard', 
        icon: LayoutDashboard 
      }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Todas as Diligências', href: '/diligences', icon: FileText },
        { name: 'Gestão de Usuários', href: '/users', icon: Users },
        { name: 'Correspondentes', href: '/correspondents', icon: UserCheck },
        { name: 'Financeiro', href: '/financial', icon: DollarSign },
        { name: 'Pagamentos', href: '/payments', icon: CreditCard },
        { name: 'Gestão de Status', href: '/status-management', icon: RotateCcw },
        { name: 'Relatórios', href: '/reports', icon: BarChart3 },
        { name: 'Calendário', href: '/calendar', icon: Calendar },
        { name: 'Configurações', href: '/settings', icon: Settings }
      ];
    }

    if (user?.role === 'client') {
      return [
        ...baseItems,
        { name: 'Minhas Diligências', href: '/my-diligences', icon: FileText },
        { name: 'Solicitar Diligência', href: '/new-diligence', icon: Plus },
        { name: 'Financeiro', href: '/financial', icon: DollarSign },
        { name: 'Calendário', href: '/calendar', icon: Calendar }
      ];
    }

    if (user?.role === 'correspondent') {
      return [
        ...baseItems,
        { name: 'Oportunidades', href: '/available-diligences', icon: Target },
        { name: 'Minhas Diligências', href: '/my-diligences', icon: FileText },
        { name: 'Financeiro', href: '/financial', icon: DollarSign },
        { name: 'Calendário', href: '/calendar', icon: Calendar }
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <Zap className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">JurisConnect</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:block p-1 text-gray-400 hover:text-white transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 capitalize">
                {user?.role === 'admin' ? 'Administrador' : 
                 user?.role === 'client' ? 'Cliente' : 'Correspondente'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setIsMobileOpen(false)}
            className={({ isActive }) =>
              clsx(
                'flex items-center px-3 py-2 rounded-lg transition-colors group',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                isCollapsed ? 'justify-center' : 'space-x-3'
              )
            }
            title={isCollapsed ? item.name : undefined}
          >
            <item.icon className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Platform Status */}
      {!isCollapsed && user?.role === 'admin' && (
        <div className="p-4 border-t border-gray-700">
          <div className="bg-green-900 bg-opacity-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs text-green-400 font-medium">Sistema Online</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Todos os serviços funcionando
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            JurisConnect Platform v2.0
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 text-white rounded-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className={clsx(
        'hidden lg:flex bg-gray-900 text-white min-h-screen transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 lg:hidden',
        isMobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;