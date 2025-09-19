'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateCSVFormat } from '@/lib/data-processing';

interface FileUploadProps {
  onFileUpload: (file: File, content: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function FileUpload({ onFileUpload, isLoading = false, error }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file) {
      await processFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  }, []);

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationStatus('invalid');
      return;
    }

    setUploadedFile(file);
    setValidationStatus('validating');

    try {
      const isValid = await validateCSVFormat(file);
      
      if (!isValid) {
        setValidationStatus('invalid');
        return;
      }

      setValidationStatus('valid');

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileUpload(file, content);
      };
      reader.readAsText(file);

    } catch (err) {
      console.error('File validation error:', err);
      setValidationStatus('invalid');
    }
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setValidationStatus('idle');
  };

  const getStatusIcon = () => {
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

  const getStatusMessage = () => {
    switch (validationStatus) {
      case 'validating':
        return 'Validating file format...';
      case 'valid':
        return 'File ready to process';
      case 'invalid':
        return 'Invalid CSV format. Please check your file contains the required columns: month, model, total_cost_dollars';
      default:
        return 'Upload a CSV file with your model cost data';
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : validationStatus === 'invalid'
                ? 'border-red-300 bg-red-50'
                : validationStatus === 'valid'
                  ? 'border-green-300 bg-green-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }
            ${isLoading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".csv"
            onChange={handleFileInput}
            className="hidden"
            disabled={isLoading}
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className="p-3 rounded-full bg-white shadow-sm">
              {uploadedFile ? getStatusIcon() : <Upload className="h-8 w-8 text-gray-400" />}
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {uploadedFile ? uploadedFile.name : 'Upload CSV File'}
              </h3>
              
              <p className={`text-sm ${
                validationStatus === 'invalid' 
                  ? 'text-red-600' 
                  : validationStatus === 'valid'
                    ? 'text-green-600'
                    : 'text-gray-600'
              }`}>
                {getStatusMessage()}
              </p>
              
              {!uploadedFile && (
                <p className="text-xs text-gray-500">
                  Drag and drop your CSV file here, or click to browse
                </p>
              )}
            </div>

            {uploadedFile && (
              <div className="flex space-x-2">
                {validationStatus === 'valid' && (
                  <Button 
                    size="sm" 
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      // File is already processed in processFile
                    }}
                  >
                    {isLoading ? 'Processing...' : 'File Ready'}
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  disabled={isLoading}
                >
                  Choose Different File
                </Button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs text-gray-500">
          <p><strong>Required CSV format:</strong></p>
          <ul className="mt-1 list-disc list-inside space-y-1">
            <li><code>month</code> - Date in YYYY-MM-DD format</li>
            <li><code>model</code> - Model name</li>
            <li><code>total_cost_dollars</code> - Cost amount in dollars</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
