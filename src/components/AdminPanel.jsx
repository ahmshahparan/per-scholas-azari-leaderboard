import React, { useState } from 'react';
import { Upload, Trash2, LogOut, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const AdminPanel = ({ onDataUploaded }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [message, setMessage] = useState(null);
  const [fileName, setFileName] = useState('');
  const { logout, user } = useAuth();

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please select a CSV file' });
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setMessage(null);

    try {
      const csvContent = await file.text();
      const result = await apiService.uploadData(csvContent);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: `Data uploaded successfully! Processed ${result.summary?.totalUsers || 0} users.` 
        });
        
        // Notify parent component to refresh data
        if (onDataUploaded) {
          onDataUploaded();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Upload failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsUploading(false);
      setFileName('');
      // Clear file input
      event.target.value = '';
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all analysis data? This action cannot be undone.')) {
      return;
    }

    setIsClearing(true);
    setMessage(null);

    try {
      const result = await apiService.clearData();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'All data cleared successfully' });
        
        // Notify parent component to refresh data
        if (onDataUploaded) {
          onDataUploaded();
        }
      } else {
        setMessage({ type: 'error', text: result.error || 'Clear failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsClearing(false);
    }
  };

  const handleLogout = () => {
    logout();
    setMessage(null);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white p-2 rounded-lg">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600">Welcome back, {user?.username || 'Admin'}! Manage Per Scholas Azari engagement data.</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-md flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          Upload New Analysis Data
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Upload a CSV file with Per Scholas student interaction data to update the leaderboard rankings.
          </p>
          
          <div className="flex items-center gap-3">
            <label className="flex-1">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
              <div className={`
                border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer
                hover:border-blue-400 hover:bg-blue-50 transition-colors
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {isUploading ? 'Uploading...' : fileName || 'Click to select CSV file'}
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="bg-white rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Trash2 className="h-5 w-5 text-red-600" />
          Data Management
        </h3>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Clear all leaderboard data from the database. This will remove all student rankings and statistics.
          </p>
          
          <button
            onClick={handleClearData}
            disabled={isClearing}
            className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            {isClearing ? 'Clearing...' : 'Clear All Data'}
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-700">
          <strong>Note:</strong> All changes will be immediately visible to users viewing the leaderboard. 
          The system automatically filters out perscholas.org domain emails from rankings.
        </p>
      </div>
    </div>
  );
};

export default AdminPanel;

