'use client';

import React from 'react';
import { Minus, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PowerUserStateButtonProps {
  isPowerUser: boolean | undefined;
  onClick: () => void;
  className?: string;
}

export function PowerUserStateButton({ isPowerUser, onClick, className = '' }: PowerUserStateButtonProps) {
  const getStateConfig = () => {
    if (isPowerUser === true) {
      return {
        icon: Check,
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        borderColor: 'border-green-300',
        ariaLabel: 'Power User - Click to change to Not Power User',
      };
    } else if (isPowerUser === false) {
      return {
        icon: X,
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        borderColor: 'border-red-300',
        ariaLabel: 'Not Power User - Click to clear classification',
      };
    } else {
      return {
        icon: Minus,
        bgColor: 'bg-gray-200',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        ariaLabel: 'Unmarked - Click to mark as Power User',
      };
    }
  };

  const config = getStateConfig();
  const Icon = config.icon;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={`h-6 w-6 p-0 ${config.bgColor} ${config.textColor} ${config.borderColor} hover:opacity-80 ${className}`}
      aria-label={config.ariaLabel}
    >
      <Icon className="h-3 w-3" />
    </Button>
  );
}

