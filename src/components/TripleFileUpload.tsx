'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, DollarSign, Users, Code, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { validateCSVFormat } from '@/lib/data-processing';
import { validateWAUCSVFormat } from '@/lib/wau-data-processing';
import { validateAICodeCSVFormat } from '@/lib/ai-code-data-processing';
import { validateActiveUserGrowthCSVFormat } from '@/lib/active-user-growth-processing';
import { validatePercentileCSVFormat } from '@/lib/percentile-data-processing';
import { validateMCPUsageCSVFormat } from '@/lib/mcp-usage-processing';
import { validateRuleUsageCSVFormat } from '@/lib/rule-usage-processing';
import { DataType } from '@/types';

interface TripleFileUploadProps {
  onModelCostsUpload: (file: File, content: string) => void;
  onWAUUpload: (file: File, content: string) => void;
  onAICodeUpload: (file: File, content: string) => void;
  onActiveUserGrowthUpload: (file: File, content: string) => void;
  onPercentileUpload: (file: File, content: string) => void;
  onMCPUsageUpload: (file: File, content: string) => void;
  onRuleUsageUpload: (file: File, content: string) => void;
  isLoading?: boolean;
  error?: string | null;
  hasModelCostsData?: boolean;
  hasWAUData?: boolean;
  hasAICodeData?: boolean;
  hasActiveUserGrowthData?: boolean;
  hasPercentileData?: boolean;
  hasMCPUsageData?: boolean;
  hasRuleUsageData?: boolean;
}

interface UploadState {
  file: File | null;
  validationStatus: 'idle' | 'validating' | 'valid' | 'invalid';
}

export function TripleFileUpload({ 
  onModelCostsUpload, 
  onWAUUpload, 
  onAICodeUpload,
  onActiveUserGrowthUpload,
  onPercentileUpload,
  onMCPUsageUpload,
  onRuleUsageUpload,
  isLoading = false, 
  error,
  hasModelCostsData = false,
  hasWAUData = false,
  hasAICodeData = false,
  hasActiveUserGrowthData = false,
  hasPercentileData = false,
  hasMCPUsageData = false,
  hasRuleUsageData = false
}: TripleFileUploadProps) {
  const [modelCostsState, setModelCostsState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });
  
  const [wauState, setWAUState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [aiCodeState, setAICodeState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [activeUserGrowthState, setActiveUserGrowthState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [percentileState, setPercentileState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [mcpUsageState, setMCPUsageState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [ruleUsageState, setRuleUsageState] = useState<UploadState>({
    file: null,
    validationStatus: 'idle'
  });

  const [isDragOver, setIsDragOver] = useState<DataType | null>(null);

  const processFile = useCallback(async (file: File, dataType: DataType) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      if (dataType === 'MODEL_COSTS') {
        setModelCostsState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'WAU_ANALYTICS') {
        setWAUState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'AI_CODE_METRICS') {
        setAICodeState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'ACTIVE_USER_GROWTH') {
        setActiveUserGrowthState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'PERCENTILE_DATA') {
        setPercentileState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'MCP_USAGE') {
        setMCPUsageState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'RULE_USAGE') {
        setRuleUsageState(prev => ({ ...prev, validationStatus: 'invalid' }));
      }
      return;
    }

    // Set validating status
    if (dataType === 'MODEL_COSTS') {
      setModelCostsState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'WAU_ANALYTICS') {
      setWAUState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'AI_CODE_METRICS') {
      setAICodeState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'ACTIVE_USER_GROWTH') {
      setActiveUserGrowthState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'PERCENTILE_DATA') {
      setPercentileState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'MCP_USAGE') {
      setMCPUsageState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    } else if (dataType === 'RULE_USAGE') {
      setRuleUsageState(prev => ({ ...prev, file, validationStatus: 'validating' }));
    }

    try {
      let isValid = false;
      
      if (dataType === 'MODEL_COSTS') {
        isValid = await validateCSVFormat(file);
      } else if (dataType === 'WAU_ANALYTICS') {
        isValid = await validateWAUCSVFormat(file);
      } else if (dataType === 'AI_CODE_METRICS') {
        isValid = await validateAICodeCSVFormat(file);
      } else if (dataType === 'ACTIVE_USER_GROWTH') {
        isValid = await validateActiveUserGrowthCSVFormat(file);
      } else if (dataType === 'PERCENTILE_DATA') {
        isValid = await validatePercentileCSVFormat(file);
      } else if (dataType === 'MCP_USAGE') {
        isValid = await validateMCPUsageCSVFormat(file);
      } else if (dataType === 'RULE_USAGE') {
        isValid = await validateRuleUsageCSVFormat(file);
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
      } else if (dataType === 'AI_CODE_METRICS') {
        setAICodeState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      } else if (dataType === 'ACTIVE_USER_GROWTH') {
        setActiveUserGrowthState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      } else if (dataType === 'PERCENTILE_DATA') {
        setPercentileState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      } else if (dataType === 'MCP_USAGE') {
        setMCPUsageState(prev => ({ 
          ...prev, 
          validationStatus: isValid ? 'valid' : 'invalid' 
        }));
      } else if (dataType === 'RULE_USAGE') {
        setRuleUsageState(prev => ({ 
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
      } else if (dataType === 'AI_CODE_METRICS') {
        setAICodeState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'ACTIVE_USER_GROWTH') {
        setActiveUserGrowthState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'PERCENTILE_DATA') {
        setPercentileState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'MCP_USAGE') {
        setMCPUsageState(prev => ({ ...prev, validationStatus: 'invalid' }));
      } else if (dataType === 'RULE_USAGE') {
        setRuleUsageState(prev => ({ ...prev, validationStatus: 'invalid' }));
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
    let uploadHandler: (file: File, content: string) => void;

    if (dataType === 'MODEL_COSTS') {
      state = modelCostsState;
      uploadHandler = onModelCostsUpload;
    } else if (dataType === 'WAU_ANALYTICS') {
      state = wauState;
      uploadHandler = onWAUUpload;
    } else if (dataType === 'AI_CODE_METRICS') {
      state = aiCodeState;
      uploadHandler = onAICodeUpload;
    } else if (dataType === 'ACTIVE_USER_GROWTH') {
      state = activeUserGrowthState;
      uploadHandler = onActiveUserGrowthUpload;
    } else if (dataType === 'PERCENTILE_DATA') {
      state = percentileState;
      uploadHandler = onPercentileUpload;
    } else if (dataType === 'MCP_USAGE') {
      state = mcpUsageState;
      uploadHandler = onMCPUsageUpload;
    } else if (dataType === 'RULE_USAGE') {
      state = ruleUsageState;
      uploadHandler = onRuleUsageUpload;
    } else {
      return;
    }

    if (!state.file || state.validationStatus !== 'valid') return;

    try {
      const content = await state.file.text();
      uploadHandler(state.file, content);
    } catch (error) {
      console.error('File reading error:', error);
    }
  }, [modelCostsState, wauState, aiCodeState, activeUserGrowthState, percentileState, mcpUsageState, ruleUsageState, onModelCostsUpload, onWAUUpload, onAICodeUpload, onActiveUserGrowthUpload, onPercentileUpload, onMCPUsageUpload, onRuleUsageUpload]);

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
    iconColor 
  }: {
    dataType: DataType;
    state: UploadState;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    hasData: boolean;
    borderColor: string;
    iconColor: string;
  }) => (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Icon className={`h-5 w-5 ${iconColor}`} />
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {hasData && (
          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
            Loaded
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-600">{description}</p>
      
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="h-8 w-8 text-gray-400" />
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900">
              Drop your CSV file here, or{' '}
              <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                browse
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileSelect(file, dataType);
                  }}
                />
              </label>
            </p>
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
              onClick={() => handleUpload(dataType)}
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Data Upload</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          <FileUploadSection
            dataType="MODEL_COSTS"
            state={modelCostsState}
            title="Model Costs"
            description="Upload CSV with model usage costs and spending data"
            icon={DollarSign}
            hasData={hasModelCostsData}
            borderColor="border-blue-400"
            iconColor="text-blue-600"
          />
          
          <FileUploadSection
            dataType="WAU_ANALYTICS"
            state={wauState}
            title="WAU Analytics"
            description="Upload CSV with weekly active user analytics data"
            icon={Users}
            hasData={hasWAUData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />

          <FileUploadSection
            dataType="AI_CODE_METRICS"
            state={aiCodeState}
            title="AI Code Metrics"
            description="Upload CSV with user AI code generation statistics"
            icon={Code}
            hasData={hasAICodeData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />

          <FileUploadSection
            dataType="ACTIVE_USER_GROWTH"
            state={activeUserGrowthState}
            title="Agent WAU Analytics"
            description="Upload CSV with agent WAU, L4, and power user data"
            icon={TrendingUp}
            hasData={hasActiveUserGrowthData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />

          <FileUploadSection
            dataType="PERCENTILE_DATA"
            state={percentileState}
            title="Percentile Distribution"
            description="Upload CSV with percentile and interactions data"
            icon={BarChart3}
            hasData={hasPercentileData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />

          <FileUploadSection
            dataType="MCP_USAGE"
            state={mcpUsageState}
            title="Weekly MCP Usage"
            description="Upload CSV with weekly MCP usage data"
            icon={TrendingUp}
            hasData={hasMCPUsageData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />

          <FileUploadSection
            dataType="RULE_USAGE"
            state={ruleUsageState}
            title="Weekly Rule Usage"
            description="Upload CSV with weekly rule usage data"
            icon={TrendingUp}
            hasData={hasRuleUsageData}
            borderColor="border-orange-400"
            iconColor="text-orange-600"
          />
        </div>
      </CardContent>
    </Card>
  );
}
