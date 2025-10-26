'use client';

import React, { useCallback, useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataSourceLink } from './DataSourceLink';
import { MODEL_COSTS_HEX_URL, WAU_ANALYTICS_HEX_URL } from '@/lib/data-source-links';
import { validateCSVFormat } from '@/lib/data-processing';
import { validateWAUCSVFormat } from '@/lib/wau-data-processing';
import { DataType } from '@/types';

interface GeneralAdoptionUploadProps {
  onModelCostsUpload: (file: File, content: string) => Promise<void>;
  onWAUUpload: (file: File, content: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
  hasModelCostsData?: boolean;
  hasWAUData?: boolean;
}

interface UploadState {
  file: File | null;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
}

export function GeneralAdoptionUpload({
  onModelCostsUpload,
  onWAUUpload,
  isLoading = false,
  error,
  hasModelCostsData = false,
  hasWAUData = false
}: GeneralAdoptionUploadProps) {
  const [modelCostsState, setModelCostsState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });
  
  const [wauState, setWAUState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [isDragOver, setIsDragOver] = useState<DataType | null>(null);

  // Create refs for file inputs
  const modelCostsInputRef = useRef<HTMLInputElement>(null);
  const wauInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File, dataType: DataType) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'WAU_ANALYTICS') {
        setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
      }
      return;
    }

    if (dataType === 'MODEL_COSTS') {
      setModelCostsState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'WAU_ANALYTICS') {
      setWAUState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    }

    try {
      let isValid = false;
      
      if (dataType === 'MODEL_COSTS') {
        isValid = await validateCSVFormat(file);
      } else if (dataType === 'WAU_ANALYTICS') {
        isValid = await validateWAUCSVFormat(file);
      }

      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      } else if (dataType === 'WAU_ANALYTICS') {
        setWAUState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      }
    } catch (error) {
      console.error('Validation error:', error);
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'WAU_ANALYTICS') {
        setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
      }
    }
  }, []);

  const handleFileSelect = useCallback((file: File, dataType: DataType) => {
    processFile(file, dataType);
  }, [processFile]);

  const handleDrop = useCallback((e: React.DragEvent, dataType: DataType) => {
    e.preventDefault();
    setIsDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0], dataType);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent, dataType: DataType) => {
    e.preventDefault();
    setIsDragOver(dataType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(null);
  }, []);

  const handleUpload = useCallback(async (dataType: DataType) => {
    let state: UploadState;
    let uploadHandler: (file: File, content: string) => Promise<void>;

    if (dataType === 'MODEL_COSTS') {
      state = modelCostsState;
      uploadHandler = onModelCostsUpload;
    } else if (dataType === 'WAU_ANALYTICS') {
      state = wauState;
      uploadHandler = onWAUUpload;
    } else {
      return;
    }

    if (!state.file || state.validationStatus !== 'valid') return;

    try {
      const content = await state.file.text();
      await uploadHandler(state.file, content);
      console.log(`[GeneralAdoptionUpload] Successfully uploaded ${dataType}`);
    } catch (error) {
      console.error('File reading error:', error);
    }
  }, [modelCostsState, wauState, onModelCostsUpload, onWAUUpload]);

  const getStatusIcon = (status: UploadState['validationStatus']) => {
    switch (status) {
      case 'validating':
        return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />;
      case 'valid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadState['validationStatus']) => {
    switch (status) {
      case 'validating':
        return 'Validating...';
      case 'valid':
        return 'Valid CSV format';
      case 'invalid':
        return 'Invalid CSV format';
      default:
        return 'No file selected';
    }
  };

  const FileUploadSection = ({ 
    dataType, 
    state, 
    title, 
    description, 
    icon: Icon,
    hasData,
    borderColor,
    iconColor,
    hexUrl
  }: {
    dataType: DataType;
    state: UploadState;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    hasData: boolean;
    borderColor: string;
    iconColor: string;
    hexUrl: string | null;
  }) => {
    // Get the appropriate ref for this data type
    const inputRef = dataType === 'MODEL_COSTS' ? modelCostsInputRef : wauInputRef;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon className={`h-5 w-5 ${iconColor}`} />
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {hasData && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Loaded
              </span>
            )}
          </div>
          {hexUrl && <DataSourceLink href={hexUrl} />}
        </div>
        
        <p className="text-sm text-gray-600">{description}</p>
      
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
            isDragOver === dataType
              ? `${borderColor} bg-blue-50`
              : state.validationStatus === 'valid'
              ? 'border-green-300 bg-green-50'
              : state.validationStatus === 'invalid'
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={(e) => handleDrop(e, dataType)}
          onDragOver={(e) => handleDragOver(e, dataType)}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                Drop your CSV file here, or{' '}
                <span 
                  className="text-blue-600 hover:text-blue-500 cursor-pointer underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  browse
                </span>
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, dataType);
                  e.currentTarget.value = '';
                }}
              />
              <p className="text-xs text-gray-500 mt-1">CSV files only</p>
            </div>
            
            {state.file && (
              <div className="flex items-center justify-center space-x-2 text-sm">
                {getStatusIcon(state.validationStatus)}
                <span className={`${
                  state.validationStatus === 'valid' ? 'text-green-600' :
                  state.validationStatus === 'invalid' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                  {state.file.name} - {getStatusText(state.validationStatus)}
                </span>
              </div>
            )}
            
            {state.validationStatus === 'valid' && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUpload(dataType);
                }}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? 'Processing...' : `Upload ${title}`}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Account Data</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FileUploadSection
            dataType="MODEL_COSTS"
            state={modelCostsState}
            title="Model Costs"
            description="Upload account model costs and usage data"
            icon={DollarSign}
            hasData={hasModelCostsData}
            borderColor="border-blue-400"
            iconColor="text-blue-600"
            hexUrl={MODEL_COSTS_HEX_URL}
          />
          
          <FileUploadSection
            dataType="WAU_ANALYTICS"
            state={wauState}
            title="WAU Analytics"
            description="Upload account WAU and engagement metrics"
            icon={Users}
            hasData={hasWAUData}
            borderColor="border-blue-400"
            iconColor="text-blue-600"
            hexUrl={WAU_ANALYTICS_HEX_URL}
          />
        </div>
      </CardContent>
    </Card>
  );
}
