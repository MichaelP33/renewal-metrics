'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, DollarSign, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { validateCSVFormat } from '@/lib/data-processing';
import { validateWAUCSVFormat } from '@/lib/wau-data-processing';
import { DataType } from '@/types';

interface DualFileUploadProps {
  onModelCostsUpload: (file: File, content: string) => void;
  onWAUUpload: (file: File, content: string) => void;
  isLoading?: boolean;
  error?: string | null;
  hasModelCostsData?: boolean;
  hasWAUData?: boolean;
}

interface UploadState {
  file: File | null;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
}

export function DualFileUpload({ 
  onModelCostsUpload, 
  onWAUUpload, 
  isLoading = false, 
  error,
  hasModelCostsData = false,
  hasWAUData = false
}: DualFileUploadProps) {
  const [modelCostsState, setModelCostsState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });
  
  const [wauState, setWAUState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [isDragOver, setIsDragOver] = useState<DataType | null>(null);

  const processFile = useCallback(async (file: File, dataType: DataType) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else {
        setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
      }
      return;
    }

    // Set file and start validation
    if (dataType === 'MODEL_COSTS') {
      setModelCostsState({ file, validationStatus: 'validating' });
    } else {
      setWAUState({ file, validationStatus: 'validating' });
    }

    try {
      const isValid = dataType === 'MODEL_COSTS' 
        ? await validateCSVFormat(file)
        : await validateWAUCSVFormat(file);
      
      if (!isValid) {
        if (dataType === 'MODEL_COSTS') {
          setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
        } else {
          setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
        }
        return;
      }

      // Mark as valid
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'valid' }));
      } else {
        setWAUState(prev => ({ ...prev, validationStatus: 'valid' }));
      }

      // Read file content and call appropriate handler
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (dataType === 'MODEL_COSTS') {
          onModelCostsUpload(file, content);
        } else {
          onWAUUpload(file, content);
        }
      };
      reader.readAsText(file);

    } catch (err) {
      console.error('File validation error:', err);
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else {
        setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
      }
    }
  }, [onModelCostsUpload, onWAUUpload]);

  const handleDrop = useCallback(async (e: React.DragEvent, dataType: DataType) => {
    e.preventDefault();
    setIsDragOver(null);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      await processFile(file, dataType);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent, dataType: DataType) => {
    e.preventDefault();
    setIsDragOver(dataType);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(null);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, dataType: DataType) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file, dataType);
    }
  }, [processFile]);

  const resetUpload = (dataType: DataType) => {
    if (dataType === 'MODEL_COSTS') {
      setModelCostsState({ file: null, validationStatus: 'idle' });
    } else {
      setWAUState({ file: null, validationStatus: 'idle' });
    }
  };

  const getStatusIcon = (validationStatus: UploadState['validationStatus']) => {
    switch (validationStatus) {
      case 'validating':
        return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />;
      case 'valid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'invalid':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusMessage = (validationStatus: UploadState['validationStatus'], dataType: DataType) => {
    switch (validationStatus) {
      case 'validating':
        return 'Validating file format...';
      case 'valid':
        return 'File ready to process';
      case 'invalid':
        if (dataType === 'MODEL_COSTS') {
          return 'Invalid CSV format. Please check your file contains the required columns: month, model, total_cost_dollars';
        } else {
          return 'Invalid CSV format. Please check your file contains the required columns: week, weekly_usage, weekly_tabs, wau_count, requestsper';
        }
      default:
        if (dataType === 'MODEL_COSTS') {
          return 'Upload a CSV file with your model cost data';
        } else {
          return 'Upload a CSV file with your WAU analytics data';
        }
    }
  };

  const renderUploadArea = (dataType: DataType, state: UploadState, icon: React.ReactNode, title: string) => {
    const isActive = isDragOver === dataType;
    const isDisabled = isLoading;
    const hasData = dataType === 'MODEL_COSTS' ? hasModelCostsData : hasWAUData;

    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {hasData && (
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Data Loaded
            </span>
          )}
        </div>

        <div
          className={`
            border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
            ${isActive 
              ? 'border-blue-500 bg-blue-50' 
              : state.validationStatus === 'invalid'
                ? 'border-red-300 bg-red-50'
                : state.validationStatus === 'valid'
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
            ${isDisabled ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onDrop={(e) => handleDrop(e, dataType)}
          onDragOver={(e) => handleDragOver(e, dataType)}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById(`${dataType}-file-input`)?.click()}
        >
          <input
            id={`${dataType}-file-input`}
            type="file"
            accept=".csv"
            onChange={(e) => handleFileInput(e, dataType)}
            className="hidden"
            disabled={isDisabled}
          />
          
          <div className="flex flex-col items-center space-y-3">
            <div className="p-2 rounded-full bg-white shadow-sm">
              {state.file ? getStatusIcon(state.validationStatus) : <Upload className="h-6 w-6 text-gray-400" />}
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">
                {state.file ? state.file.name : `Upload ${title} CSV`}
              </h4>
              
              <p className={`text-xs ${
                state.validationStatus === 'invalid' 
                  ? 'text-red-600' 
                  : state.validationStatus === 'valid'
                    ? 'text-green-600'
                    : 'text-gray-600'
              }`}>
                {getStatusMessage(state.validationStatus, dataType)}
              </p>
              
              {!state.file && (
                <p className="text-xs text-gray-500">
                  Drag and drop your CSV file here, or click to browse
                </p>
              )}
            </div>

            {state.file && (
              <div className="flex space-x-2">
                {state.validationStatus === 'valid' && (
                  <Button 
                    size="sm" 
                    disabled={isDisabled}
                    onClick={(e) => {
                      e.stopPropagation();
                      // File is already processed in processFile
                    }}
                  >
                    {isDisabled ? 'Processing...' : 'File Ready'}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload(dataType);
                  }}
                  disabled={isDisabled}
                >
                  Choose Different File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Format requirements */}
        <div className="text-xs text-gray-500">
          <p><strong>Required CSV format for {title}:</strong></p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            {dataType === 'MODEL_COSTS' ? (
              <>
                <li><code>month</code> - Date in YYYY-MM-DD format</li>
                <li><code>model</code> - Model name</li>
                <li><code>total_cost_dollars</code> - Cost amount in dollars</li>
              </>
            ) : (
              <>
                <li><code>week</code> - Date in YYYY-MM-DD format</li>
                <li><code>weekly_usage</code> - Weekly usage count</li>
                <li><code>weekly_tabs</code> - Weekly tabs count</li>
                <li><code>wau_count</code> - Weekly active users count</li>
                <li><code>requestsper</code> - Requests per user</li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Upload Your Data</CardTitle>
        <p className="text-sm text-gray-600">
          Upload CSV files for model cost analysis and/or WAU analytics. You can upload one or both types of data.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Model Costs Upload */}
        {renderUploadArea(
          'MODEL_COSTS',
          modelCostsState,
          <DollarSign className="h-5 w-5 text-blue-600" />,
          'Model Costs'
        )}

        <Separator />

        {/* WAU Analytics Upload */}
        {renderUploadArea(
          'WAU_ANALYTICS',
          wauState,
          <Users className="h-5 w-5 text-orange-600" />,
          'WAU Analytics'
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
