'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Code, Users, Bot, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePowerUsers } from '@/contexts/PowerUsersContext';
import { DataSourceLink } from '../DataSourceLink';
import { TAM_MISSION_CONTROL_HEX_URL } from '@/lib/data-source-links';

interface FileUploadState {
  file: File | null;
  status: 'idle' | 'parsing' | 'success' | 'error';
  error?: string;
}

export function PowerUsersUpload() {
  const { uploadDataset, uploadStatus, clearData, cachedTimestamp, hasData, masterUsers } = usePowerUsers();
  
  const [aiState, setAiState] = useState<FileUploadState>({ file: null, status: 'idle' });
  const [featuresState, setFeaturesState] = useState<FileUploadState>({ file: null, status: 'idle' });
  const [agentState, setAgentState] = useState<FileUploadState>({ file: null, status: 'idle' });
  
  // Create refs at parent level to avoid recreation issues
  const aiInputRef = useRef<HTMLInputElement>(null);
  const featuresInputRef = useRef<HTMLInputElement>(null);
  const agentInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (kind: 'ai' | 'features' | 'agent', file: File) => {
    console.log(`[Upload] File selected for ${kind}:`, file.name, 'size:', file.size, 'type:', file.type);
    const stateSetter = kind === 'ai' ? setAiState : kind === 'features' ? setFeaturesState : setAgentState;
    
    stateSetter({ file, status: 'parsing' });
    console.log(`[Upload] State set to parsing for ${kind}`);

    try {
      console.log(`[Upload] Calling uploadDataset for ${kind}`);
      await uploadDataset(kind, file);
      console.log(`[Upload] Upload complete for ${kind}`);
      stateSetter(prev => ({ ...prev, status: 'success' }));
    } catch (error) {
      console.error(`[Upload] Upload failed for ${kind}:`, error);
      stateSetter(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Failed to parse CSV',
      }));
    }
  }, [uploadDataset]);

  const handleClear = useCallback(() => {
    clearData();
    setAiState({ file: null, status: 'idle' });
    setFeaturesState({ file: null, status: 'idle' });
    setAgentState({ file: null, status: 'idle' });
  }, [clearData]);

  const FileUploadSection = ({
    kind,
    state,
    title,
    description,
    icon: Icon,
    iconColor,
    inputRef,
  }: {
    kind: 'ai' | 'features' | 'agent';
    state: FileUploadState;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    iconColor: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
  }) => {
    const status = uploadStatus[kind];
    const isSuccess = status === 'success';
    const isError = status === 'error';
    const isParsing = status === 'parsing';

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {isSuccess && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Loaded
              </span>
            )}
          </div>
          {(kind === 'features' || kind === 'agent') && (
            <DataSourceLink href={TAM_MISSION_CONTROL_HEX_URL} />
          )}
        </div>
        
        <p className="text-sm text-gray-600">{description}</p>
        
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isSuccess
              ? 'border-green-300 bg-green-50'
              : isError
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer?.files?.[0];
            console.log('[Upload] onDrop fired for', kind, file?.name);
            if (file) {
              if (!file.name.toLowerCase().endsWith('.csv')) {
                console.warn('[Upload] Dropped file is not a CSV:', file.name);
                return;
              }
              handleFileSelect(kind, file);
            }
          }}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your CSV file here, or{' '}
                <label htmlFor={`file-upload-${kind}`} className="text-blue-600 hover:text-blue-500 cursor-pointer underline">
                  browse
                </label>
              </p>
              <input
                id={`file-upload-${kind}`}
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  console.log('[Upload] Input onChange fired for', kind, e.target.files);
                  const file = e.target.files?.[0];
                  if (file) {
                    console.log('[Upload] File detected, calling handler');
                    handleFileSelect(kind, file);
                    // Reset input so the same file can be selected again
                    e.target.value = '';
                  } else {
                    console.log('[Upload] No file in input');
                  }
                }}
                disabled={isParsing}
              />
              <p className="text-xs text-gray-500 mt-1">CSV files only</p>
            </div>
            
            {state.file && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                {isParsing && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />}
                {isSuccess && <CheckCircle className="h-4 w-4 text-green-600" />}
                {isError && <AlertCircle className="h-4 w-4 text-red-600" />}
                <span className={isSuccess ? 'text-green-600' : isError ? 'text-red-600' : 'text-gray-600'}>
                  {state.file.name}
                </span>
              </div>
            )}

            {isError && state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {state.error}
              </div>
            )}

            {isSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                Successfully uploaded and parsed
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Cached data indicator */}
      {cachedTimestamp && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <p className="text-sm text-blue-900">
                  Using cached data from {new Date(cachedTimestamp).toLocaleString()}
                </p>
              </div>
              <Button
                onClick={handleClear}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Power Users Data</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUploadSection
            kind="ai"
            state={aiState}
            title="AI Code Metrics"
            description="Upload CSV with user AI code generation statistics"
            icon={Code}
            iconColor="text-blue-600"
            inputRef={aiInputRef}
          />
          
          <FileUploadSection
            kind="features"
            state={featuresState}
            title="Power User Features"
            description="Upload CSV with power user feature usage data"
            icon={Users}
            iconColor="text-green-600"
            inputRef={featuresInputRef}
          />

          <FileUploadSection
            kind="agent"
            state={agentState}
            title="Agent Requests"
            description="Upload CSV with agent request and session data"
            icon={Bot}
            iconColor="text-purple-600"
            inputRef={agentInputRef}
          />
        </CardContent>
      </Card>

      {/* Data summary */}
      {hasData && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Summary</h3>
                <p className="text-sm text-gray-600">
                  {masterUsers.length} unique users aggregated from uploaded datasets
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {uploadStatus.ai === 'success' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    AI Code
                  </span>
                )}
                {uploadStatus.features === 'success' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Features
                  </span>
                )}
                {uploadStatus.agent === 'success' && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    Agent
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!hasData && !cachedTimestamp && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Uploaded</h3>
            <p className="text-gray-600">
              Upload CSV files above to start analyzing power user data. You can upload one, two, or all three files.
            </p>
          </CardContent>
        </Card>
      )}

      {/* ARIA live region for screen readers */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {uploadStatus.ai === 'parsing' && 'Parsing AI code metrics file'}
        {uploadStatus.features === 'parsing' && 'Parsing power user features file'}
        {uploadStatus.agent === 'parsing' && 'Parsing agent requests file'}
        {hasData && `Data loaded successfully. ${masterUsers.length} users aggregated.`}
      </div>
    </div>
  );
}

