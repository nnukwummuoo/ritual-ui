"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "material-react-toastify";
import { URL } from "@/api/config";
import { useAuthToken } from "@/lib/hooks/useAuthToken";
import { golds } from "@/data/intresttypes";

interface RevenueData {
  goldAmount: string;
  purchase: number;
  total: number;
  profit: number;
  revenue: number;
  percentage: number;
}

interface RevenueResponse {
  success: boolean;
  month: number | null;
  year: number | null;
  totalRevenue: number;
  revenueData: RevenueData[];
}

const RevenuePage = () => {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const token = useAuthToken();

  // Generate month and year options
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Fetch revenue data
  const fetchRevenueData = useCallback(async () => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedMonth) params.append("month", selectedMonth);
      if (selectedYear) params.append("year", selectedYear);

      const response = await fetch(`${URL}/api/admin/transactions/revenue?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch revenue data");
      }

      const data: RevenueResponse = await response.json();
      
      if (data.success) {
        setRevenueData(data.revenueData || []);
        setTotalRevenue(data.totalRevenue || 0);
      } else {
        throw new Error("Failed to fetch revenue data");
      }
    } catch (error) {
      toast.error("Failed to load revenue data");
    } finally {
      setLoading(false);
    }
  }, [token, selectedMonth, selectedYear]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    fetchRevenueData();
  }, [fetchRevenueData]);

  // Create complete gold pack list (excluding test pack) and merge with revenue data
  const completeRevenueData = useMemo(() => {
    // Filter out test pack and create base structure
    const allGoldPacks = golds
      .filter((gold) => gold.tag !== 'Test Pack')
      .map((gold) => {
        const goldValue = Number(gold.value);
        const bonus = gold.bonus || '';
        
        // Calculate gold amount with bonus
        let goldAmount = goldValue.toString();
        if (bonus && bonus !== '') {
          const bonusPercent = parseFloat(bonus.replace('%', ''));
          const bonusGold = Math.round(goldValue * (bonusPercent / 100));
          const totalGold = goldValue + bonusGold;
          goldAmount = `${goldValue} + (${bonus} BONUS) = ${totalGold}`;
        }

        return {
          goldValue,
          goldAmount,
          purchase: 0,
          total: 0,
          profit: 0,
          revenue: 0,
          percentage: 0,
        };
      })
      .sort((a, b) => b.goldValue - a.goldValue); // Sort descending by gold value

    // Create a map of revenue data by base gold value
    const revenueMap = new Map<number, RevenueData>();
    revenueData.forEach((item) => {
      // Extract the base gold value from the goldAmount string (first number)
      // Handles formats like "1000 + (37% BONUS) = 1037" or "50"
      const match = item.goldAmount.match(/^(\d+)/);
      if (match) {
        const baseGold = parseInt(match[1]);
        revenueMap.set(baseGold, item);
      }
    });

    // Merge revenue data with all gold packs
    return allGoldPacks.map((pack) => {
      const revenueItem = revenueMap.get(pack.goldValue);
      
      if (revenueItem) {
        return {
          goldAmount: revenueItem.goldAmount,
          purchase: revenueItem.purchase,
          total: revenueItem.total || 0,
          profit: revenueItem.profit || 0,
          revenue: revenueItem.revenue || 0,
          percentage: revenueItem.percentage,
        };
      }
      
      return {
        goldAmount: pack.goldAmount,
        purchase: 0,
        total: 0,
        profit: 0,
        revenue: 0,
        percentage: 0,
      };
    });
  }, [revenueData]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Revenue Analysis</h1>
          <p className="text-gray-400 mt-2">View revenue breakdown by gold pack</p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Month
              </label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-gray-700 [&>option]:text-white"
              >
                <option value="">All Time</option>
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent [&>option]:bg-gray-700 [&>option]:text-white"
              >
                <option value="">All Time</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Revenue Display */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Total Revenue
              </label>
              <div className="px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg">
                <span className="text-lg font-semibold">${totalRevenue.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Table */}
        <div
          className="w-full bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-white border-collapse">
                <thead>
                  <tr className="border-b border-[#323544]">
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">
                      Gold Amount
                    </th>
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">
                      Purchase
                    </th>
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">
                      Total
                    </th>
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">
                      Profit
                    </th>
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center border-r border-[#323544] whitespace-nowrap">
                      Revenue
                    </th>
                    <th className="py-2 px-2 font-semibold text-sm sm:text-base text-center whitespace-nowrap">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {completeRevenueData.map((row, index) => (
                    <tr
                      key={index}
                      className="border-b border-[#323544] last:border-b-0 hover:bg-gray-700"
                    >
                      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
                        {row.goldAmount}
                      </td>
                      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
                        {row.purchase}
                      </td>
                      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
                        {row.total}
                      </td>
                      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
                        ${row.profit.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center text-sm sm:text-base border-r border-[#323544] whitespace-nowrap">
                        ${row.revenue.toFixed(2)}
                      </td>
                      <td className="py-2 px-2 text-center text-sm sm:text-base whitespace-nowrap">
                        {row.percentage.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenuePage;

