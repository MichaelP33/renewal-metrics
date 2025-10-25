'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Shortcut {
  key: string;
  description: string;
  category: 'Navigation' | 'Filters' | 'Cohorts' | 'General';
}

const shortcuts: Shortcut[] = [
  { key: '/', description: 'Focus search input', category: 'Filters' },
  { key: 'Cmd/Ctrl + K', description: 'Focus search input', category: 'Filters' },
  { key: 'Cmd/Ctrl + S', description: 'Save current filters as cohort', category: 'Cohorts' },
  { key: 'Cmd/Ctrl + E', description: 'Clear all filters', category: 'Filters' },
  { key: 'Cmd/Ctrl + \\', description: 'Toggle comparison builder', category: 'Cohorts' },
  { key: '?', description: 'Show keyboard shortcuts', category: 'General' },
  { key: 'Esc', description: 'Close dialogs or clear focus', category: 'General' },
];

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {(['Navigation', 'Filters', 'Cohorts', 'General'] as const).map((category) => {
            const categoryShortcuts = shortcuts.filter(s => s.category === category);
            if (categoryShortcuts.length === 0) return null;
            
            return (
              <div key={category} className="space-y-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div key={shortcut.key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

