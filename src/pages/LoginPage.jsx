import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../hooks/useAuth.jsx';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setAuthError('');
    setLoading(true);

    const result = login(data.email, data.password);
    if (result.success) {
      navigate('/');
    } else {
      setAuthError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-muted/5 rounded-full blur-[120px]"></div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-muted hover:text-white transition-all duration-300 z-10 p-2 rounded-full hover:bg-white/5"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="bg-surface border border-muted/20 shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-[448px] relative z-10 fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-bold tracking-tighter text-white">my<span className="text-primary">Flix</span></Link>
          <h1 className="text-2xl font-bold text-white mt-6">Welcome Back</h1>
          <p className="text-muted/70 mt-2">Access your cinematic universe</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              {...register('email')}
              className={`w-full p-4 bg-background/50 text-white rounded-xl border focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-muted/40 ${
                errors.email ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-muted/30 focus:border-primary focus:ring-primary/20'
              }`}
            />
            {errors.email && <p className="text-red-400 text-xs mt-1 px-1">{errors.email.message}</p>}
          </div>

          <div className="relative space-y-2">
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                {...register('password')}
                className={`w-full p-4 bg-background/50 text-white rounded-xl border pr-12 focus:outline-none focus:ring-2 transition-all duration-300 placeholder:text-muted/40 ${
                  errors.password ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-muted/30 focus:border-primary focus:ring-primary/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted/50 hover:text-primary transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="text-red-400 text-xs mt-1 px-1">{errors.password.message}</p>}
          </div>

          {authError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{authError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
          >
            {loading ? 'Accessing...' : 'Access Account'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-muted/70">
            New to myFlix?{' '}
            <Link to="/signup" className="text-primary hover:underline transition-colors font-bold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;