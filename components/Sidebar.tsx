'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarDays, 
  FolderKanban, 
  Users, 
  Mail,
  LayoutDashboard,
  LogOut 
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Календар', href: '/calendar', icon: CalendarDays },
  { name: 'Проекти', href: '/projects', icon: FolderKanban },
  { name: 'Працівники', href: '/employees', icon: Users },
  { name: 'Запрошення', href: '/invitations', icon: Mail },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Бізнес Календар</h1>
        <p className="text-gray-400 text-sm">AMM Company</p>
      </div>

      {session?.user && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold mb-2">
            {session.user.name
              ?.split(' ')
              .map((n) => n[0])
              .join('') || 'U'}
          </div>
          <p className="font-medium text-white truncate">{session.user.name}</p>
          <p className="text-sm text-gray-400 truncate">{session.user.email}</p>
          {session.user.role && (
            <span className="inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
              {session.user.role === 'admin' && 'Адміністратор'}
              {session.user.role === 'manager' && 'Менеджер'}
              {session.user.role === 'employee' && 'Працівник'}
            </span>
          )}
        </div>
      )}
      
      <nav className="space-y-1 flex-1">
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

      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-red-600 hover:text-white mt-4"
      >
        <LogOut className="w-5 h-5" />
        <span>Вийти</span>
      </button>
    </aside>
  );
}
