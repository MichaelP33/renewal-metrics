'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PowerUsersProvider, usePowerUsers } from '@/contexts/PowerUsersContext';
import { PowerUsersUpload } from '@/components/power-users/PowerUsersUpload';
import { MasterTable } from '@/components/power-users/MasterTable';
import { MasterTableFilters, FilterState } from '@/components/power-users/MasterTableFilters';
import { PowerUsersVisualizations } from '@/components/power-users/PowerUsersVisualizations';
import { KeyboardShortcutsDialog } from '@/components/power-users/KeyboardShortcutsDialog';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Upload, Table, BarChart3 } from 'lucide-react';

function PowerUsersContent() {
  const { hasData, enhancedUsers, filteredEnhancedUsers } = usePowerUsers();
  const [activeTab, setActiveTab] = useState<'upload' | 'table' | 'visualizations'>('upload');
  const [filters, setFilters] = useState<FilterState>({
    searchText: '',
    isMcpUser: null,
    isRuleCreator: null,
    isRuleUser: null,
    isCommandCreator: null,
    isCommandUser: null,
    isPowerUserFilter: ['true', 'false', 'unmarked'],
    aiLinesMin: '',
    aiLinesMax: '',
    sessionsMin: '',
    sessionsMax: '',
    requestsMin: '',
    requestsMax: '',
    engagementScoreMin: '',
    engagementScoreMax: '',
  });
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [, setShowSaveCohortDialog] = useState(false);
  const [, setShowComparisonBuilder] = useState(true);
  const searchInputRef = useRef<HTMLInputElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const filterRef = useRef<{ clearAll: () => void; openSaveDialog: () => void } | null>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // Focus search input: / or Cmd/Ctrl + K
      if ((e.key === '/' || (cmdOrCtrl && e.key === 'k')) && activeTab === 'table') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }

      // Save as cohort: Cmd/Ctrl + S
      if (cmdOrCtrl && e.key === 's' && activeTab === 'table') {
        e.preventDefault();
        setShowSaveCohortDialog(true);
      }

      // Clear all filters: Cmd/Ctrl + E
      if (cmdOrCtrl && e.key === 'e' && activeTab === 'table') {
        e.preventDefault();
        setFilters({
          searchText: '',
          isMcpUser: null,
          isRuleCreator: null,
          isRuleUser: null,
          isCommandCreator: null,
          isCommandUser: null,
          isPowerUserFilter: ['true', 'false', 'unmarked'],
          aiLinesMin: '',
          aiLinesMax: '',
          sessionsMin: '',
          sessionsMax: '',
          requestsMin: '',
          requestsMax: '',
          engagementScoreMin: '',
          engagementScoreMax: '',
        });
      }

      // Toggle comparison builder: Cmd/Ctrl + \
      if (cmdOrCtrl && e.key === '\\' && activeTab === 'visualizations') {
        e.preventDefault();
        setShowComparisonBuilder(prev => !prev);
      }

      // Toggle shortcuts dialog
      if (e.key === '?') {
        e.preventDefault();
        setShowShortcutsDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Power Users Analytics</h1>
          <p className="text-gray-600">
            Upload and analyze user data across AI code metrics, power user features, and agent requests
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Tip: Press <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">/</kbd> to search, <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">?</kbd> for shortcuts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upload')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upload'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span>Upload Data</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('table')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'table'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Table className="h-4 w-4" />
                  <span>Master Table</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('visualizations')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'visualizations'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Visualizations</span>
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'upload' && <PowerUsersUpload />}
        
        {activeTab === 'table' && (
          hasData ? (
            <div className="space-y-6">
              <MasterTableFilters 
                onFilterChange={setFilters} 
                searchInputRef={searchInputRef}
                onApplyCohortFilters={setFilters}
              />
              <MasterTable rows={enhancedUsers} filters={filters} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">Upload data in the Upload Data tab to view the master table.</p>
              </CardContent>
            </Card>
          )
        )}

        {activeTab === 'visualizations' && (
          hasData ? (
            <PowerUsersVisualizations data={filteredEnhancedUsers} />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
                <p className="text-gray-600 mb-4">Upload data in the Upload Data tab to view visualizations.</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={showShortcutsDialog}
        onClose={() => setShowShortcutsDialog(false)}
      />
    </div>
  );
}

export default function PowerUsersPage() {
  return (
    <PowerUsersProvider>
      <PowerUsersContent />
    </PowerUsersProvider>
  );
}

