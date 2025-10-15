'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { URL } from '@/api/config';
import { useAuthToken } from '@/lib/hooks/useAuthToken';
import { toast } from 'material-react-toastify';
import axios from 'axios';

interface VipAnalysisData {
  monthlyData: {
    month: string;
    monthKey: string;
    vipUsers: number;
    autoRenewalUsers: number;
    nonRenewalUsers: number;
    totalEarnings: number;
    newUsers: number;
  }[];
  summary: {
    totalVipUsers: number;
    activeVipUsers: number;
    totalAutoRenewalUsers: number;
    totalNonRenewalUsers: number;
    totalEarnings: number;
    expiringVipUsers: number;
    autoRenewalRate: string;
  };
  trends: {
    vipGrowth: string;
    earningsGrowth: string;
  };
}

const VipAnalysisPage = () => {
  const [data, setData] = useState<VipAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(5);
  const token = useAuthToken();

  const fetchVipAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await axios.get(`${URL}/vipanalysis?months=${selectedMonths}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      if (response.data.ok) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch data');
      }
    } catch (err: unknown) {
      console.error('Error fetching VIP analysis:', err);
      const errorMessage = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || (err as Error)?.message || 'An error occurred';
      setError(errorMessage);
      toast.error(`Failed to load VIP analysis data: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonths]);

  useEffect(() => {
    if (token) {
      fetchVipAnalysis();
    }
  }, [token, selectedMonths, fetchVipAnalysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">Error: {error}</div>
        <button
          onClick={fetchVipAnalysis}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">No data available</div>
      </div>
    );
  }

  // Prepare data for pie chart (auto-renewal vs non-renewal)
  const renewalData = [
    { name: 'Auto Renewal', value: data.summary.totalAutoRenewalUsers, color: '#10b981' },
    { name: 'Non-renewal', value: data.summary.totalNonRenewalUsers, color: '#f59e0b' }
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Month Filter */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-200">Filter by months:</label>
          <select
            value={selectedMonths}
            onChange={(e) => setSelectedMonths(parseInt(e.target.value))}
            className="px-3 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={3}>Last 3 months</option>
            <option value={5}>Last 5 months</option>
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
          </select>
          <div className="text-sm text-gray-400">
            VIP Earnings: $4.00 per user per month (100 gold × $0.04)
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Total VIP Users</h3>
          <p className="text-3xl font-bold">{data.summary.totalVipUsers}</p>
          <p className="text-sm opacity-90">Active: {data.summary.activeVipUsers}</p>
        </div>
        
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Auto Renewal Rate</h3>
          <p className="text-3xl font-bold">{data.summary.autoRenewalRate}%</p>
          <p className="text-sm opacity-90">{data.summary.totalAutoRenewalUsers} users</p>
        </div>
        
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Total VIP Earnings</h3>
          <p className="text-3xl font-bold">${data.summary.totalEarnings.toFixed(2)}</p>
          <p className="text-sm opacity-90">Past {selectedMonths} months</p>
        </div>
        
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 rounded-lg text-white">
          <h3 className="text-lg font-semibold mb-2">Expiring Soon</h3>
          <p className="text-3xl font-bold">{data.summary.expiringVipUsers}</p>
          <p className="text-sm opacity-90">Next 7 days</p>
        </div>
      </div>

      {/* Growth Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">VIP Growth Trend</h3>
          <div className="text-center">
            <p className={`text-2xl font-bold ${parseFloat(data.trends.vipGrowth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.trends.vipGrowth}%
            </p>
            <p className="text-sm text-gray-400">Over {selectedMonths} months</p>
          </div>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Earnings Growth Trend</h3>
          <div className="text-center">
            <p className={`text-2xl font-bold ${parseFloat(data.trends.earningsGrowth) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.trends.earningsGrowth}%
            </p>
            <p className="text-sm text-gray-400">Over {selectedMonths} months</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* VIP Users Over Time */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">VIP Users Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="vipUsers"
                stackId="1"
                stroke="#8884d8"
                fill="#8884d8"
                name="VIP Users"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Auto vs Non-renewal */}
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Renewal Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={renewalData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {renewalData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Monthly VIP Breakdown</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="autoRenewalUsers" stackId="a" fill="#10b981" name="Auto Renewal" />
            <Bar dataKey="nonRenewalUsers" stackId="a" fill="#f59e0b" name="Non-renewal" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Earnings Chart */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Monthly Earnings</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value}`, 'Earnings']} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalEarnings"
              stroke="#8884d8"
              strokeWidth={3}
              name="Earnings"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>


      {/* Detailed Table */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-gray-200">Detailed Monthly Data</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-600">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  VIP Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Auto Renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Non-renewal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  New Users
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-600">
              {data.monthlyData.slice().reverse().map((month, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                    {month.month}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {month.vipUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {month.autoRenewalUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {month.nonRenewalUsers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    ${month.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                    {month.newUsers}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VipAnalysisPage;
