import React, { useState } from 'react';
import { useNavigate } from 'react-router';

interface UserDetails {
  username: string;
  email: string;
  password: string;
}

const Account: React.FC = () => {
  const navigate = useNavigate();

  // Mock user data - in a real app, this would come from an API
  const [userDetails, setUserDetails] = useState<UserDetails>({
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: '********',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UserDetails>({ ...userDetails });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm({ ...userDetails });
  };

  const handleSave = () => {
    // In a real app, this would make an API call to update user details
    setUserDetails({ ...editForm });
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditForm({ ...userDetails });
    setIsEditing(false);
  };

  const handleLogout = () => {
    // In a real app, this would clear authentication tokens and redirect to login
    if (window.confirm('Are you sure you want to logout?')) {
      alert('Logged out successfully!');
      navigate('/');
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would make an API call to delete the account
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      alert('Account deleted successfully!');
      navigate('/');
    }
  };

  return (
    <div className="container mx-auto p-4 bg-green-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-green-800 mb-8">Account Settings</h1>

        {/* User Details Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-green-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-green-800">User Details</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <div className="space-x-2">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Username
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-green-800 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  {userDetails.username}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-green-800 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  {userDetails.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-green-700 mb-1">
                Password
              </label>
              {isEditing ? (
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              ) : (
                <p className="text-green-800 bg-green-50 px-3 py-2 rounded-md border border-green-200">
                  {userDetails.password}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Actions Section */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
          <h2 className="text-xl font-semibold text-green-800 mb-6">Account Actions</h2>

          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
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