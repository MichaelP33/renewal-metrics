'use client';

import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MasterUserRecord } from '@/types/power-users';

interface UserDetailDrawerProps {
  user: MasterUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailDrawer({ user, isOpen, onClose }: UserDetailDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  if (!user) return null;

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined || value === null) return '—';
    return value.toLocaleString();
  };

  const formatPercentage = (value: number | undefined): string => {
    if (value === undefined || value === null) return '—';
    return `${value.toFixed(1)}%`;
  };

  const formatBoolean = (value: boolean | undefined): string => {
    if (value === undefined || value === null) return '—';
    return value ? 'Yes' : 'No';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Identity Section */}
          <section aria-labelledby="identity-heading">
            <h2 id="identity-heading" className="text-lg font-semibold mb-3">Identity</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user.email}</span>
              </div>
              {user.firstName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">First Name:</span>
                  <span className="font-medium">{user.firstName}</span>
                </div>
              )}
              {user.lastName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Name:</span>
                  <span className="font-medium">{user.lastName}</span>
                </div>
              )}
              {user.linkedinUrl && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">LinkedIn:</span>
                  <a
                    href={user.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
                  >
                    <span>View Profile</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* AI Code Metrics Section */}
          {user.sourceFlags.aiCode && (
            <section aria-labelledby="ai-code-heading">
              <h2 id="ai-code-heading" className="text-lg font-semibold mb-3">AI Code Metrics</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">AI Lines Changed:</span>
                  <span className="font-mono font-medium">{formatNumber(user.aiLinesChanged)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Lines Changed:</span>
                  <span className="font-mono font-medium">{formatNumber(user.totalLinesChanged)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI % of Code:</span>
                  <span className="font-mono font-medium">{formatPercentage(user.pctAiCode)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Commit Count:</span>
                  <span className="font-mono font-medium">{formatNumber(user.commitCount)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Agent Activity Section */}
          {user.sourceFlags.agentRequests && (
            <section aria-labelledby="agent-activity-heading">
              <h2 id="agent-activity-heading" className="text-lg font-semibold mb-3">Agent Activity</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sessions:</span>
                  <span className="font-mono font-medium">{formatNumber(user.totalSessions)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Agent Requests:</span>
                  <span className="font-mono font-medium">{formatNumber(user.totalAgentRequests)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Power Features Section */}
          {user.sourceFlags.features && (
            <section aria-labelledby="power-features-heading">
              <h2 id="power-features-heading" className="text-lg font-semibold mb-3">Power Features</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">MCP User:</span>
                  <span className="font-medium">{formatBoolean(user.isMcpUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rule Creator:</span>
                  <span className="font-medium">{formatBoolean(user.isRuleCreator)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rule User:</span>
                  <span className="font-medium">{formatBoolean(user.isRuleUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Command Creator:</span>
                  <span className="font-medium">{formatBoolean(user.isCommandCreator)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Command User:</span>
                  <span className="font-medium">{formatBoolean(user.isCommandUser)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Products Used:</span>
                  <span className="font-mono font-medium">{formatNumber(user.numProductsUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Membership Days:</span>
                  <span className="font-mono font-medium">{formatNumber(user.membershipDays)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Data Sources Section */}
          <section aria-labelledby="data-sources-heading">
            <h2 id="data-sources-heading" className="text-lg font-semibold mb-3">Data Sources</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">AI Code:</span>
                <span className={user.sourceFlags.aiCode ? 'text-green-600' : 'text-gray-400'}>
                  {user.sourceFlags.aiCode ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Features:</span>
                <span className={user.sourceFlags.features ? 'text-green-600' : 'text-gray-400'}>
                  {user.sourceFlags.features ? '✓' : '✗'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Agent Requests:</span>
                <span className={user.sourceFlags.agentRequests ? 'text-green-600' : 'text-gray-400'}>
                  {user.sourceFlags.agentRequests ? '✓' : '✗'}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button
            ref={closeButtonRef}
            variant="outline"
            onClick={onClose}
            aria-label="Close user details"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

