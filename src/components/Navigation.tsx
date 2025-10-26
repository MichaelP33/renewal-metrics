'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, TrendingUp, Target, Users } from 'lucide-react';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              pathname === '/'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {pathname === '/' && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cursor-orange)] rounded-r" />
            )}
            <Home className="h-4 w-4" />
            <span>Overview</span>
          </Link>
          <Link
            href="/general-adoption"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              pathname === '/general-adoption'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {pathname === '/general-adoption' && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cursor-orange)] rounded-r" />
            )}
            <TrendingUp className="h-4 w-4" />
            <span>General adoption</span>
          </Link>
          <Link
            href="/team-trends"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              pathname === '/team-trends'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {pathname === '/team-trends' && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cursor-orange)] rounded-r" />
            )}
            <Target className="h-4 w-4" />
            <span>Team trends</span>
          </Link>
          <Link
            href="/power-users"
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
              pathname === '/power-users'
                ? 'text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {pathname === '/power-users' && (
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-[var(--cursor-orange)] rounded-r" />
            )}
            <Users className="h-4 w-4" />
            <span>Power users</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

