// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Download, Upload, AlertCircle, HelpCircle, LogOut } from 'lucide-react';
import Help from './Help';
import GoogleDriveService from '../services/GoogleDriveService';

export default function CloudStorage() {
  const [showHelp, setShowHelp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const driveService = GoogleDriveService.getInstance();

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        setIsLoading(true);
        setError(null);
        const email = await driveService.initialize(response.access_token);
        setIsAuthenticated(true);
        setUserEmail(email);
      } catch (error: any) {
        setError(error.message || 'Failed to authenticate with Google Drive');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      setError('Failed to sign in with Google. Using local storage as fallback.');
      setIsAuthenticated(false);
    }
  });

  const handleBackup = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get all data from localStorage
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          data[key] = localStorage.getItem(key);
        }
      }

      if (isAuthenticated) {
        // Try cloud backup first
        try {
          await driveService.backup(data);
          alert('Backup completed successfully to Google Drive!');
        } catch (error) {
          // Fall back to local backup
          handleLocalBackup(data);
          setError('Cloud backup failed. Data saved locally instead.');
        }
      } else {
        // Use local backup
        handleLocalBackup(data);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to backup data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalBackup = (data: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `app_dev_journal_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const handleRestore = async () => {
    if (!isAuthenticated) {
      // Create file input for local restore
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = handleLocalRestore;
      input.click();
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await driveService.restore();
      
      if (confirm('This will replace all current data. Are you sure you want to continue?')) {
        localStorage.clear();
        Object.entries(data).forEach(([key, value]) => {
          localStorage.setItem(key, value as string);
        });
        window.location.reload();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to restore data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalRestore = (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          
          if (confirm('This will replace all current data. Are you sure you want to continue?')) {
            localStorage.clear();
            Object.entries(data).forEach(([key, value]) => {
              localStorage.setItem(key, value as string);
            });
            window.location.reload();
          }
        } catch (error) {
          setError('Error restoring data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail(null);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Cloud Storage</h2>
          {userEmail && (
            <div className="text-sm text-gray-400">
              Signed in as: {userEmail}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          )}
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600"
            title="Help"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-400">{error}</p>
              <p className="text-red-300/80 text-sm mt-1">
                Local storage is still available as a fallback option.
              </p>
            </div>
          </div>
        </div>
      )}

      {!isAuthenticated && (
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h3 className="text-lg font-semibold mb-4">Connect to Google Drive</h3>
          <p className="text-gray-400 mb-6">
            Sign in with Google to enable cloud storage and sync your data across devices.
          </p>
          <button
            onClick={() => login()}
            className="bg-blue-600 px-6 py-2 rounded-lg hover:bg-blue-500"
            disabled={isLoading}
          >
            {isLoading ? 'Connecting...' : 'Sign in with Google'}
          </button>
          <p className="text-sm text-gray-500 mt-4">
            You can still use local storage without signing in
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={handleBackup}
          className="flex items-center justify-center gap-2 bg-blue-600 p-4 rounded-lg hover:bg-blue-500"
          disabled={isLoading}
        >
          <Download size={20} />
          <span>{isAuthenticated ? 'Backup to Drive' : 'Download Backup'}</span>
        </button>

        <button
          onClick={handleRestore}
          className="flex items-center justify-center gap-2 bg-green-600 p-4 rounded-lg hover:bg-green-500"
          disabled={isLoading}
        >
          <Upload size={20} />
          <span>{isAuthenticated ? 'Restore from Drive' : 'Restore from File'}</span>
        </button>
      </div>

      {showHelp && (
        <Help
          title="Cloud Storage Help"
          sections={[
            {
              title: "Google Drive Integration",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Getting Started</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Sign in with your Google account to enable cloud storage</li>
                      <li>Your data will be securely stored in your Google Drive</li>
                      <li>Access your data from any device</li>
                      <li>Local storage is always available as a backup</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Backup & Restore",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <h5 className="font-medium mb-2">Cloud Storage</h5>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Automatic fallback to local storage if cloud fails</li>
                      <li>All data is encrypted during transfer</li>
                      <li>Restore from your latest cloud backup</li>
                      <li>Switch between cloud and local storage anytime</li>
                    </ul>
                  </div>
                </div>
              )
            },
            {
              title: "Troubleshooting",
              content: (
                <div className="space-y-4">
                  <div className="bg-gray-700 p-4 rounded">
                    <ul className="list-disc list-inside space-y-2">
                      <li>If cloud storage fails, your data will be saved locally</li>
                      <li>You can sign out and sign back in to refresh the connection</li>
                      <li>Local backups work without internet connection</li>
                      <li>Contact support if you need help with Google Drive access</li>
                    </ul>
                  </div>
                </div>
              )
            }
          ]}
          onClose={() => setShowHelp(false)}
        />
      )}
    </div>
  );
}