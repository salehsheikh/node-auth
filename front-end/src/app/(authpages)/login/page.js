"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { FaFacebookF } from "react-icons/fa6";
import { FaGoogle } from "react-icons/fa";
export default function Login() {
   const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
    const [loginError, setLoginError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
    if (result.success) {
      router.push('/dashboard');
    }
     else {
      setLoginError(result.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
                    {loginError && (
            <div className="mb-4 text-red-500 text-sm text-center">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Login
          </button>
        </form>
          <div className="flex flex-col space-y-4">
      <a 
        href={`${backendUrl}/api/auth/google`}
        className="bg-red-500 text-white py-2 px-4 rounded flex items-center justify-center"
      >
        <FaGoogle className="mr-2" size={20} />
        Continue with Google
      </a>
      
      <a
        href={`${backendUrl}/api/auth/facebook`}
        className="bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
      >
        <FaFacebookF className="mr-2" size={20} />
        Continue with Facebook
      </a>
    </div>
        <p className="mt-4 text-center">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-center">
          <Link href="/forget-password" className="text-blue-500 hover:underline">
            Forgot Password?
          </Link>
        </p>
      </div>
    </div>
  );
}