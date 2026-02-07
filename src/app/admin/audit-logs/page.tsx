"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";

type AuditLogWithUser = {
  id: string;
  timestamp: string;
  result: "SUCCESS" | "FAILURE";
  ip: string | null;
  user: {
    id: string;
    email: string | null;
    name: string | null;
  };
};

type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
};

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLogWithUser[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedResult, setSelectedResult] = useState<"SUCCESS" | "FAILURE" | "">("");

  // Load admin users for filter dropdown
  useEffect(() => {
    const loadAdminUsers = async () => {
      try {
        const response = await fetch("/api/admin/admins");
        const result: ApiResponse<AdminUser[]> = await response.json();
        if (result.success && result.data) {
          setAdminUsers(result.data);
        }
      } catch (err) {
        console.error("Error loading admin users:", err);
      }
    };
    loadAdminUsers();
  }, []);

  // Load audit logs
  const loadAuditLogs = async (page = 1) => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: page.toString(),
      limit: "50",
    });

    if (selectedAdminId) params.set("adminId", selectedAdminId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (selectedResult) params.set("result", selectedResult);

    try {
      const response = await fetch(`/api/admin/audit-logs?${params}`);
      const result: ApiResponse<{
        auditLogs: AuditLogWithUser[];
        pagination: PaginationInfo;
      }> = await response.json();

      if (result.success && result.data) {
        setAuditLogs(result.data.auditLogs);
        setPagination(result.data.pagination);
      } else {
        setError(result.error || "Failed to load audit logs");
      }
    } catch (err) {
      setError("Failed to load audit logs");
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadAuditLogs();
  }, [selectedAdminId, startDate, endDate, selectedResult]);

  const handlePageChange = (newPage: number) => {
    loadAuditLogs(newPage);
  };

  const clearFilters = () => {
    setSelectedAdminId("");
    setStartDate("");
    setEndDate("");
    setSelectedResult("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-600">
          View login attempts and security events
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin User
            </label>
            <select
              value={selectedAdminId}
              onChange={(e) => setSelectedAdminId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Admins</option>
              {adminUsers.map((admin) => (
                <option key={admin.id} value={admin.id}>
                  {admin.email} ({admin.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result
            </label>
            <select
              value={selectedResult}
              onChange={(e) => setSelectedResult(e.target.value as "SUCCESS" | "FAILURE" | "")}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Results</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILURE">Failure</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading audit logs...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="px-6 py-4 bg-gray-50 border-b">
              <p className="text-sm text-gray-600">
                Showing {auditLogs.length} of {pagination?.total || 0} audit logs
                {pagination && pagination.totalPages > 1 && (
                  <span> (Page {pagination.page} of {pagination.totalPages})</span>
                )}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Result
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IP Address
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        No audit logs found
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(log.timestamp), "yyyy-MM-dd HH:mm:ss")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{log.user.email}</div>
                            {log.user.name && (
                              <div className="text-gray-500 text-xs">{log.user.name}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              log.result === "SUCCESS"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {log.result}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {log.ip || "N/A"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}