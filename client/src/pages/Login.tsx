import React, { useState } from 'react';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, signup, isLoading, error } = useAuthenticate();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await login({ username, password });
      if (success) {
        navigate('/');
      }
    } else {
      const success = await signup({ username, password });
      if (success) {
        navigate('/');
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Dark section */}
      <div className="hidden lg:flex lg:w-1/2 bg-black items-center justify-center p-12">
        <div className="max-w-lg">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Notlify</h2>
          </div>
          <p className="text-xl text-white font-light mb-8">
            "The future of note-taking is here. Simple, secure, and elegant."
          </p>
          <div className="text-gray-400">
            <p>Saket Aryan, Developer</p>
          </div>
        </div>
      </div>

      {/* Right side - Light section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">Welcome to the future</h1>
            <p className="text-gray-600">
              Enter your credentials to continue your journey
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-medium text-black hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-gray-600">
            By clicking continue, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;