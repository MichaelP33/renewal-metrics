'use client';

import React, { useState, useEffect } from 'react';
import { Info, X, Filter, Save, Repeat, BarChart3, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CohortWorkflowGuideProps {
  onDismiss?: () => void;
}

const STORAGE_KEY = 'dismissedCohortGuide';

export function CohortWorkflowGuide({ onDismiss }: CohortWorkflowGuideProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    // Check if guide was previously dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY) === 'true';
    setIsDismissed(dismissed);
    setIsExpanded(!dismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setIsDismissed(true);
    setIsExpanded(false);
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleReopen = () => {
    setIsExpanded(true);
  };

  if (isDismissed && !isExpanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleReopen}
        className="text-xs text-gray-500 hover:text-gray-700"
      >
        <Info className="h-3 w-3 mr-1" />
        Show Cohort Guide
      </Button>
    );
  }

  const steps = [
    {
      icon: Filter,
      title: 'Filter Users',
      description: 'Apply filters to find specific user groups',
      color: 'text-blue-600',
    },
    {
      icon: Save,
      title: 'Save as Cohort',
      description: 'Click "Save as Cohort" to create a named group',
      color: 'text-orange-600',
    },
    {
      icon: Repeat,
      title: 'Repeat',
      description: 'Create multiple cohorts with different filters',
      color: 'text-green-600',
    },
    {
      icon: BarChart3,
      title: 'Compare',
      description: 'Select 2-6 cohorts to compare their metrics',
      color: 'text-purple-600',
    },
  ];

  return (
    <Card className="mb-4 border-blue-200 bg-blue-50/50 animate-in slide-in-from-top duration-200">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">How to Use Cohorts</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss guide"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-white rounded-md border border-gray-200"
              >
                <div className={`flex-shrink-0 ${step.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">Step {index + 1}</span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 mb-1">{step.title}</h4>
                  <p className="text-xs text-gray-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-blue-200">
          <p className="text-xs text-gray-600">
            Tip: Cohorts are saved automatically and persist across sessions
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="text-xs"
          >
            <CheckCircle className="h-3 w-3 mr-1" />
            Got it
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

