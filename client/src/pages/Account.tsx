
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { logoutUser, useGetUser } from '../queries/user';
import { useQueryClient } from '@tanstack/react-query';

const Account: React.FC = () => {

  const navigate = useNavigate();
  const { error, data: user } = useGetUser()

  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // if there is an error fetching user data, redirect to home since session is inactive
  useEffect(() => {
    if (error) {
      queryClient.removeQueries({
        "queryKey": ["user"]
      })
      navigate("/")
    }
  }, [error])

  const handleLogout = async () => {

    setIsLoggingOut(true);
    const isLoggedOut = await logoutUser()
    if (isLoggedOut) {
      queryClient.removeQueries({
        "queryKey": ["user"]
      })
      navigate('/')
    }
    setIsLoggingOut(false);
  };

  const handleDeleteAccount = async () => {

    // api call tok delete user data on the backend
  };

  return (
    <div className="container mx-auto p-4 bg-green-50 min-h-screen">
      {/* Add logout loading animation */}
      {isLoggingOut && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Account Settings</h1>

        {/* User Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-green-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-green-800">User Details</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Username
              </label>

              <p className="text-green-800 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                {user?.username}
              </p>

            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Email Address
              </label>

              <p className="text-green-800 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                {user?.email}
              </p>

            </div>

          </div>
        </div>

        {/* Account Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-6">Account Actions</h2>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="cursor-pointer w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Logout
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;