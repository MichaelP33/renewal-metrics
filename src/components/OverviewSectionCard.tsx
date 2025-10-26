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
  const isComplete = loadedCount === totalCount;

  return (
    <Card className="transition-all hover:shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="bg-gray-100 p-3 rounded-lg">
            <div className="text-gray-600">
              {icon}
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {loadedCount}/{totalCount} loaded
          </div>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        
        <Link href={href}>
          <Button className="w-full bg-gray-900 hover:bg-[var(--cursor-orange)] text-white transition-colors">
            {isComplete ? 'View metrics' : 'View section'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

