'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface OverviewSectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  loadedCount: number;
  totalCount: number;
  themeColor: 'blue' | 'orange' | 'green';
}

export function OverviewSectionCard({
  title,
  description,
  icon,
  href,
  loadedCount,
  totalCount,
  themeColor
}: OverviewSectionCardProps) {
  const colorClasses = {
    blue: {
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      badgeBg: 'bg-blue-50',
      badgeText: 'text-blue-700',
      badgeBorder: 'border-blue-200',
      buttonBg: 'bg-blue-600 hover:bg-blue-700'
    },
    orange: {
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      badgeBg: 'bg-orange-50',
      badgeText: 'text-orange-700',
      badgeBorder: 'border-orange-200',
      buttonBg: 'bg-orange-600 hover:bg-orange-700'
    },
    green: {
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badgeBg: 'bg-green-50',
      badgeText: 'text-green-700',
      badgeBorder: 'border-green-200',
      buttonBg: 'bg-green-600 hover:bg-green-700'
    }
  };

  const colors = colorClasses[themeColor];
  const isComplete = loadedCount === totalCount;

  return (
    <Card className="transition-all hover:shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className={`${colors.iconBg} p-3 rounded-lg`}>
            <div className={colors.iconColor}>
              {icon}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}>
            {loadedCount}/{totalCount} loaded
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        
        <Link href={href}>
          <Button className={`w-full ${colors.buttonBg} text-white`}>
            {isComplete ? 'View Metrics' : 'View Section'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

