'use client';

import { useAuth } from '@/app/contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

function DashboardContent() {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Admin Dashboard</h1>
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800">Welcome, {user?.userName || 'User'}!</h2>
            <p className="text-gray-600 mt-1">Email: {user?.email}</p>
            <p className="text-gray-600 mt-1">Role: {user?.role}</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium text-gray-700">Authentication Status</h3>
              <p className="text-green-600 mt-1">✓ You are authenticated as an admin</p>
            </div>

            <button
              onClick={logout}
              className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
