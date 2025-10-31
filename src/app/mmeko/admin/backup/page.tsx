"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { useUserId } from '@/lib/hooks/useUserId';
import { URL } from '@/api/config';

interface BackupInfo {
  name: string;
  size: number;
  lastModified: string;
  date: string;
  status?: string;
  error?: string | null;
  location?: string | null;
}

interface BackupStatus {
  success: boolean;
  totalBackups: number;
  totalSize: number;
  latestBackup: (BackupInfo & { status?: string; error?: string | null }) | null;
  daysSinceLastBackup: number | null;
  history: BackupInfo[];
  failedBackups?: number;
  lastChecked: string;
}

export default function BackupManagement() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'failed'>('all');
  
  const token = useAuthToken();
  const userid = useUserId();

  const fetchBackupStatus = useCallback(async () => {
    try {
      const response = await fetch(`${URL}/api/backup/status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backup status');
      }

      const data = await response.json();
      setBackupStatus(data);
    } catch (error) {
      console.error('Error fetching backup status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [token]);


  useEffect(() => {
    if (token && userid) {
      fetchBackupStatus();
    }
  }, [fetchBackupStatus, token, userid]);

  const history = backupStatus?.history ?? [];
  const failedBackups = history.filter((backup) => backup.status === 'failed');
  const displayedHistory = activeTab === 'failed' ? failedBackups : history;

  const renderStatusBadge = (status?: string) => {
    const normalized = (status || 'success').toLowerCase();
    const styles: Record<string, string> = {
      success: 'bg-green-100 text-green-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      error: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    const dotStyles: Record<string, string> = {
      success: 'bg-green-500',
      completed: 'bg-green-500',
      failed: 'bg-red-500',
      error: 'bg-red-500',
      pending: 'bg-orange-500'
    };
    const labelMap: Record<string, string> = {
      success: 'Success',
      completed: 'Success',
      failed: 'Failed',
      error: 'Failed',
      pending: 'Pending'
    };

    const badgeClass = styles[normalized] || 'bg-slate-200 text-slate-800';
    const dotClass = dotStyles[normalized] || 'bg-slate-500';
    const label = labelMap[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
        <span className={`w-2 h-2 rounded-full mr-2 ${dotClass}`}></span>
        {label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Backup Management</h1>
          <p className="text-gray-400">MongoDB database backups</p>
        </div>


        {/* Tabs */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg border transition ${activeTab === 'all' ? 'border-yellow-400 text-white bg-yellow-500/10' : 'border-gray-700 text-gray-300 hover:border-yellow-500 hover:text-white'}`}
          >
            All Backups ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-4 py-2 rounded-lg border transition ${activeTab === 'failed' ? 'border-red-400 text-white bg-red-500/10' : 'border-gray-700 text-gray-300 hover:border-red-500 hover:text-white'}`}
          >
            Failed Backups ({failedBackups.length})
          </button>
        </div>

        {/* Backup History Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">
              {activeTab === 'failed' ? 'Failed Backups' : 'Backup History'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Size
                  </th>
                  {activeTab === 'failed' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Failure Reason
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {displayedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={activeTab === 'failed' ? 5 : 4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <p className="text-lg font-medium">{activeTab === 'failed' ? 'No failed backups' : 'No backups found'}</p>
                        <p className="text-sm">
                          {activeTab === 'failed'
                            ? 'All backups have completed successfully so far'
                            : 'Create your first backup to get started'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayedHistory.map((backup, index) => (
                    <tr key={`${backup.name}-${backup.lastModified}-${index}`} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(backup.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStatusBadge(backup.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                      </td>
                      {activeTab === 'failed' && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-300">
                          {backup.error || 'Unknown error'}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Success</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Failure</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}