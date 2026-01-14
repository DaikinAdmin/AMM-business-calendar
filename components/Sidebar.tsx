'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  FolderKanban, 
  Users, 
  Mail,
  LayoutDashboard 
} from 'lucide-react';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Календар', href: '/calendar', icon: CalendarDays },
  { name: 'Проекти', href: '/projects', icon: FolderKanban },
  { name: 'Працівники', href: '/employees', icon: Users },
  { name: 'Запрошення', href: '/invitations', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Бізнес Календар</h1>
        <p className="text-gray-400 text-sm">AMM Company</p>
      </div>
      
      <nav className="space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
