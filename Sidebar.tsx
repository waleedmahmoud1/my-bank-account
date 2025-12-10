import React from 'react';
import { LayoutDashboard, Users, ArrowRightLeft, Settings, PieChart } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'الواجهة الرئيسية', icon: LayoutDashboard },
    { id: 'accounts', label: 'إدارة الحسابات', icon: Users },
    { id: 'transactions', label: 'إدارة العمليات', icon: ArrowRightLeft },
    { id: 'settings', label: 'الإعدادات والنسخ', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed inset-y-0 right-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="p-6 border-b flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-lg text-white">
            <PieChart size={24} />
          </div>
          <h1 className="text-xl font-bold text-gray-800">مدير الأرصدة</h1>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                if (window.innerWidth < 768) onClose();
              }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${currentPage === item.id 
                  ? 'bg-primary-50 text-primary-700 font-bold' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            نسخة 1.1.0 - دعم الشيكل والدولار
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;