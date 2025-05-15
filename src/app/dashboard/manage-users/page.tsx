'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  firstName: string | null;
  lastName: string | null;
  email: string;
  enabled: boolean;
  authorities: string[];
  username: string;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
}

interface NewUserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface JWTPayload {
  role: string[];
  sub: string;
  iat: number;
  exp: number;
}

const getAuthToken = () => {
  const token = Cookies.get('authToken');
  if (!token) {
    console.error('No auth token found in cookies.');
    return null;
  }
  return token;
};

const ManageUsersPage = () => {
  const router = useRouter();
  
  // Check authorization on component mount
  useEffect(() => {
    const token = Cookies.get('authToken');
    if (!token) {
      router.push('/dashboard');
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      if (!decoded.role.includes('ROLE_ADMIN')) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      router.push('/dashboard');
    }
  }, [router]);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newUserForm, setNewUserForm] = useState<NewUserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const token = getAuthToken();
    if (!token) {
      setError('Authentication token not found.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.skyl.app/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }
      const data: User[] = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);
    const token = getAuthToken();

    if (!token) {
      setSubmitError('Authentication token not found.');
      setIsSubmitting(false);
      return;
    }

    if (!newUserForm.email || !newUserForm.password) {
        setSubmitError('Email and password are required.');
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('https://api.skyl.app/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Assuming register endpoint also needs auth for admin actions
        },
        body: JSON.stringify(newUserForm),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Failed to create user: ${response.statusText}` }));
        throw new Error(errorData.message || `Failed to create user: ${response.statusText}`);
      }
      
      setSubmitSuccess('User created successfully!');
      setNewUserForm({ firstName: '', lastName: '', email: '', password: '' }); // Reset form
      fetchUsers(); // Refresh user list
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An unknown error occurred while creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-400">Error fetching users: {error}</p>;

  return (
    <div className="container mx-auto p-2 sm:p-4 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center text-white">Manage Users</h1>

      <div className="max-w-lg mx-auto mb-8 p-4 sm:p-6 bg-gray-800 border border-gray-700 rounded-lg shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 text-white text-center">Create New User</h2>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-300">First Name</label>
            <input
              type="text"
              name="firstName"
              id="firstName"
              value={newUserForm.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-300">Last Name</label>
            <input
              type="text"
              name="lastName"
              id="lastName"
              value={newUserForm.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email*</label>
            <input
              type="email"
              name="email"
              id="email"
              value={newUserForm.email}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password*</label>
            <input
              type="password"
              name="password"
              id="password"
              value={newUserForm.password}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create User'}
          </button>
          {submitError && <p className="text-red-400 text-sm mt-2">{submitError}</p>}
          {submitSuccess && <p className="text-green-400 text-sm mt-2">{submitSuccess}</p>}
        </form>
      </div>

      <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-white">Current Users</h2>
      
      <div className="overflow-x-auto shadow-xl rounded-lg">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700 bg-gray-800">
              <thead className="bg-gray-700">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">Username</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">Roles</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700 transition-colors duration-150">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">{user.id}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-200">
                      {user.firstName || ''} {user.lastName || ''}
                      <div className="sm:hidden text-xs text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">{user.email}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400 hidden md:table-cell">{user.username}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400">
                      {user.enabled ? 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-700 text-green-100">Active</span> : 
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-700 text-red-100">Inactive</span>
                      }
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell">{user.authorities.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsersPage;
