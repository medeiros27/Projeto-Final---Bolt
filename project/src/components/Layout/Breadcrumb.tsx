import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { clsx } from 'clsx';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className }) => {
  const location = useLocation();

  // Auto-generate breadcrumb items if not provided
  const breadcrumbItems = items || generateBreadcrumbItems(location.pathname);

  if (breadcrumbItems.length <= 1) return null;

  return (
    <nav className={clsx('flex items-center space-x-2 text-sm', className)}>
      <Link
        to="/dashboard"
        className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbItems.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 text-gray-400" />
          {item.href && !item.current ? (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={clsx(
              item.current ? 'text-gray-900 font-medium' : 'text-gray-500'
            )}>
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

function generateBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  const routeLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    diligences: 'Diligências',
    'my-diligences': 'Minhas Diligências',
    'new-diligence': 'Nova Diligência',
    'available-diligences': 'Diligências Disponíveis',
    users: 'Usuários',
    correspondents: 'Correspondentes',
    financial: 'Financeiro',
    reports: 'Relatórios',
    settings: 'Configurações',
    new: 'Novo',
    edit: 'Editar'
  };

  segments.forEach((segment, index) => {
    const isLast = index === segments.length - 1;
    const href = '/' + segments.slice(0, index + 1).join('/');
    
    // Skip numeric IDs in breadcrumb
    if (/^\d+$/.test(segment)) {
      return;
    }

    items.push({
      label: routeLabels[segment] || segment,
      href: isLast ? undefined : href,
      current: isLast
    });
  });

  return items;
}

export default Breadcrumb;