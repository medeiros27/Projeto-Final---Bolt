import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import NotificationCenter from '../Notifications/NotificationCenter';
import Breadcrumb from './Breadcrumb';
import { User, LogOut, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/logotipo.png" 
              alt="JurisConnect" 
              className="h-8 w-auto"
            />
            <h1 className="text-xl font-semibold text-gray-900">
              JurisConnect
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <NotificationCenter />
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                  <Settings className="h-4 w-4" />
                </button>
                <button 
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Breadcrumb */}
        <div className="mt-3">
          <Breadcrumb />
        </div>
      </div>
    </header>
  );
};

export default Header;