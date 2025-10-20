'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Grid, Download, Search } from 'lucide-react';
import { EnhancedMasterUserRecord } from '@/types/power-users';
import { exportCSV } from '@/lib/export-utils';

interface FeatureAdoptionMatrixProps {
  data: EnhancedMasterUserRecord[];
}

interface FeatureCombo {
  mcp: boolean;
  ruleCreator: boolean;
  ruleUser: boolean;
  commandCreator: boolean;
  commandUser: boolean;
  count: number;
  users: string[];
}

export function FeatureAdoptionMatrix({ data }: FeatureAdoptionMatrixProps) {
  const [searchText, setSearchText] = useState('');

  // Calculate feature combinations
  const featureCombos = useMemo(() => {
    const comboMap = new Map<string, FeatureCombo>();

    data.forEach(user => {
      const key = `${user.isMcpUser ? '1' : '0'}-${user.isRuleCreator ? '1' : '0'}-${user.isRuleUser ? '1' : '0'}-${user.isCommandCreator ? '1' : '0'}-${user.isCommandUser ? '1' : '0'}`;
      
      if (!comboMap.has(key)) {
        comboMap.set(key, {
          mcp: user.isMcpUser ?? false,
          ruleCreator: user.isRuleCreator ?? false,
          ruleUser: user.isRuleUser ?? false,
          commandCreator: user.isCommandCreator ?? false,
          commandUser: user.isCommandUser ?? false,
          count: 0,
          users: [],
        });
      }

      const combo = comboMap.get(key)!;
      combo.count++;
      combo.users.push(user.email);
    });

    return Array.from(comboMap.values())
      .sort((a, b) => b.count - a.count);
  }, [data]);

  // Filter by search
  const filteredCombos = useMemo(() => {
    if (!searchText) return featureCombos;
    
    const searchLower = searchText.toLowerCase();
    return featureCombos.filter(combo =>
      combo.users.some(email => email.toLowerCase().includes(searchLower))
    );
  }, [featureCombos, searchText]);

  const handleExportCSV = () => {
    if (filteredCombos.length === 0) return;

    const headers = ['MCP User', 'Rule Creator', 'Rule User', 'Command Creator', 'Command User', 'User Count', 'Users'];
    const rows = filteredCombos.map(combo => [
      combo.mcp ? 'Yes' : 'No',
      combo.ruleCreator ? 'Yes' : 'No',
      combo.ruleUser ? 'Yes' : 'No',
      combo.commandCreator ? 'Yes' : 'No',
      combo.commandUser ? 'Yes' : 'No',
      String(combo.count),
      combo.users.join('; '),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const filename = `feature-adoption-matrix-${new Date().toISOString().split('T')[0]}.csv`;
    exportCSV(csvContent, filename);
  };

  const FeatureIcon = ({ enabled }: { enabled: boolean }) => (
    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
      enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
    }`}>
      {enabled ? '✓' : '✗'}
    </span>
  );

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Grid className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No feature data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Grid className="h-4 w-4" />
            <span>Feature Adoption Matrix</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center space-x-2"
          >
            <Download className="h-3 w-3" />
            <span>Export CSV</span>
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4 mb-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="search" className="text-sm flex items-center space-x-2">
              <Search className="h-3 w-3" />
              <span>Search Users</span>
            </Label>
            <Input
              id="search"
              placeholder="Search by email..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="text-center">MCP User</TableHead>
                  <TableHead className="text-center">Rule Creator</TableHead>
                  <TableHead className="text-center">Rule User</TableHead>
                  <TableHead className="text-center">Command Creator</TableHead>
                  <TableHead className="text-center">Command User</TableHead>
                  <TableHead className="text-right">User Count</TableHead>
                  <TableHead>Users</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCombos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-4">
                      No matching feature combinations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCombos.map((combo, index) => (
                    <TableRow key={index}>
                      <TableCell className="text-center">
                        <FeatureIcon enabled={combo.mcp} />
                      </TableCell>
                      <TableCell className="text-center">
                        <FeatureIcon enabled={combo.ruleCreator} />
                      </TableCell>
                      <TableCell className="text-center">
                        <FeatureIcon enabled={combo.ruleUser} />
                      </TableCell>
                      <TableCell className="text-center">
                        <FeatureIcon enabled={combo.commandCreator} />
                      </TableCell>
                      <TableCell className="text-center">
                        <FeatureIcon enabled={combo.commandUser} />
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {combo.count}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="text-xs text-gray-600 truncate" title={combo.users.join(', ')}>
                          {combo.users.slice(0, 3).join(', ')}
                          {combo.users.length > 3 && ` +${combo.users.length - 3} more`}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Showing {filteredCombos.length} feature combination{filteredCombos.length !== 1 ? 's' : ''} 
          {searchText && ` matching "${searchText}"`}
        </div>
      </CardContent>
    </Card>
  );
}

