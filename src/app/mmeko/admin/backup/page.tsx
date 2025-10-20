"use client";
import React, { useState, useEffect } from 'react';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { useUserId } from '@/lib/hooks/useUserId';
import { URL } from '@/api/config';

interface BackupInfo {
  name: string;
  size: number;
  lastModified: string;
  date: string;
}

interface BackupStatus {
  success: boolean;
  totalBackups: number;
  totalSize: number;
  latestBackup: BackupInfo | null;
  daysSinceLastBackup: number | null;
  history: BackupInfo[];
  lastChecked: string;
}

export default function BackupManagement() {
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const token = useAuthToken();
  const userid = useUserId();

  const fetchBackupStatus = async () => {
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
  };


  useEffect(() => {
    if (token && userid) {
      fetchBackupStatus();
    }
  }, [token, userid]);

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


        {/* Backup History Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Backup History</h2>
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
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {!backupStatus || !backupStatus.history || backupStatus.history.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 mb-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                        </svg>
                        <p className="text-lg font-medium">No backups found</p>
                        <p className="text-sm">Create your first backup to get started</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  (backupStatus.history || []).map((backup, index) => (
                    <tr key={index} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {new Date(backup.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Success
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'}
                      </td>
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