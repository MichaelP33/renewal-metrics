'use client';

import React, { useState } from 'react';
import { Download, Image, FileText, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { exportElementAsPNG, exportCSV, handleExportError } from '@/lib/export-utils';
import { exportToCSV } from '@/lib/data-processing';
import { AggregatedData } from '@/types';

interface ExportControlsProps {
  data: AggregatedData[];
  chartRefs: {
    barChart?: React.RefObject<HTMLDivElement | null>;
    pieChart?: React.RefObject<HTMLDivElement | null>;
    dataTable?: React.RefObject<HTMLDivElement | null>;
    dashboard?: React.RefObject<HTMLDivElement | null>;
  };
}

type ExportType = 'bar-chart' | 'pie-chart' | 'data-table' | 'dashboard' | 'csv';

export function ExportControls({ data, chartRefs }: ExportControlsProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<ExportType>('dashboard');

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      
      switch (selectedExportType) {
        case 'csv':
          if (data.length === 0) {
            throw new Error('No data available for export');
          }
          const csvContent = exportToCSV(data);
          exportCSV(csvContent, `model-costs-data-${timestamp}`);
          break;
          
        case 'bar-chart':
          if (!chartRefs.barChart?.current) {
            throw new Error('Bar chart not available for export');
          }
          await exportElementAsPNG(
            chartRefs.barChart.current,
            `model-costs-bar-chart-${timestamp}`
          );
          break;
          
        case 'pie-chart':
          if (!chartRefs.pieChart?.current) {
            throw new Error('Pie chart not available for export');
          }
          await exportElementAsPNG(
            chartRefs.pieChart.current,
            `model-costs-pie-chart-${timestamp}`
          );
          break;
          
        case 'data-table':
          if (!chartRefs.dataTable?.current) {
            throw new Error('Data table not available for export');
          }
          await exportElementAsPNG(
            chartRefs.dataTable.current,
            `model-costs-table-${timestamp}`
          );
          break;
          
        case 'dashboard':
          if (!chartRefs.dashboard?.current) {
            throw new Error('Dashboard not available for export');
          }
          await exportElementAsPNG(
            chartRefs.dashboard.current,
            `model-costs-dashboard-${timestamp}`,
            {
              backgroundColor: '#f8fafc',
              scale: 1.5
            }
          );
          break;
          
        default:
          throw new Error('Invalid export type selected');
      }
      
    } catch (error) {
      const message = handleExportError(error);
      console.error('Export failed:', message);
      // You could add a toast notification here
      alert(`Export failed: ${message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getExportOptions = () => {
    const options = [
      {
        value: 'dashboard' as ExportType,
        label: 'Full Dashboard',
        description: 'Complete dashboard as PNG',
        icon: Image,
        disabled: !chartRefs.dashboard?.current
      },
      {
        value: 'bar-chart' as ExportType,
        label: 'Bar Chart',
        description: 'Stacked bar chart as PNG',
        icon: Image,
        disabled: !chartRefs.barChart?.current
      },
      {
        value: 'pie-chart' as ExportType,
        label: 'Pie Chart',
        description: 'Pie chart as PNG',
        icon: Image,
        disabled: !chartRefs.pieChart?.current
      },
      {
        value: 'data-table' as ExportType,
        label: 'Data Table',
        description: 'Table as PNG',
        icon: Image,
        disabled: !chartRefs.dataTable?.current
      },
      {
        value: 'csv' as ExportType,
        label: 'CSV Data',
        description: 'Raw data as CSV file',
        icon: FileText,
        disabled: data.length === 0
      }
    ];

    return options;
  };

  const getCurrentOption = () => {
    return getExportOptions().find(option => option.value === selectedExportType);
  };

  const getQuickExportButtons = () => {
    return [
      {
        type: 'dashboard' as ExportType,
        label: 'Dashboard',
        icon: Image,
        disabled: !chartRefs.dashboard?.current
      },
      {
        type: 'csv' as ExportType,
        label: 'CSV',
        icon: FileText,
        disabled: data.length === 0
      }
    ];
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Options</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Export Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="export-type">Export Format</Label>
          <Select 
            value={selectedExportType} 
            onValueChange={(value: ExportType) => setSelectedExportType(value)}
          >
            <SelectTrigger id="export-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getExportOptions().map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  <div className="flex items-center space-x-2">
                    <option.icon className="h-3 w-3" />
                    <div className="flex flex-col">
                      <span>{option.label}</span>
                      <span className="text-xs text-gray-500">{option.description}</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {getCurrentOption() && (
            <p className="text-xs text-gray-600">
              {getCurrentOption()?.description}
            </p>
          )}
        </div>

        {/* Main Export Button */}
        <Button
          onClick={handleExport}
          disabled={isExporting || getCurrentOption()?.disabled}
          className="w-full"
          size="sm"
        >
          {isExporting ? (
            <>
              <Loader2 className="h-3 w-3 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-3 w-3 mr-2" />
              Export {getCurrentOption()?.label}
            </>
          )}
        </Button>

        <Separator />

        {/* Quick Export Buttons */}
        <div className="space-y-2">
          <Label className="text-sm">Quick Export</Label>
          <div className="grid grid-cols-2 gap-2">
            {getQuickExportButtons().map((button) => (
              <Button
                key={button.type}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedExportType(button.type);
                  // Auto-export after a short delay to allow state update
                  setTimeout(() => handleExport(), 100);
                }}
                disabled={isExporting || button.disabled}
                className="flex items-center space-x-1"
              >
                <button.icon className="h-3 w-3" />
                <span>{button.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Export Tips */}
        <div className="bg-blue-50 p-3 rounded-md">
          <div className="text-xs text-blue-800 space-y-1">
            <p className="font-medium">Export Tips:</p>
            <ul className="space-y-1">
              <li>• PNG exports are high-resolution for presentations</li>
              <li>• CSV exports include all processed data</li>
              <li>• Dashboard export captures the entire view</li>
              <li>• Individual charts export just that component</li>
            </ul>
          </div>
        </div>

        {/* Status */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Data points:</span>
            <span>{data.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Charts available:</span>
            <span>
              {[chartRefs.barChart, chartRefs.pieChart, chartRefs.dataTable]
                .filter(ref => ref?.current).length} / 3
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
