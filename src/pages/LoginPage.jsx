import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const result = login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#20151A] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#C1372C]/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#C0927C]/5 rounded-full blur-[120px]"></div>

      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 text-[#C0927C] hover:text-white transition-all duration-300 z-10 p-2 rounded-full hover:bg-white/5"
      >
        <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="bg-[#5E4A65] border border-[#C0927C]/20 shadow-2xl rounded-2xl p-8 sm:p-10 w-full max-w-md relative z-10 fade-in-up">
        <div className="text-center mb-8">
          <Link to="/" className="text-4xl font-bold tracking-tighter text-white">my<span className="text-[#C1372C]">Flix</span></Link>
          <h1 className="text-2xl font-bold text-white mt-6">Welcome Back</h1>
          <p className="text-[#C0927C]/70 mt-2">Access your cinematic universe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#20151A]/50 text-white rounded-xl border border-[#C0927C]/30 focus:border-[#C1372C] focus:outline-none focus:ring-2 focus:ring-[#C1372C]/20 transition-all duration-300 placeholder:text-[#C0927C]/40"
            />
          </div>

          <div className="relative space-y-2">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#20151A]/50 text-white rounded-xl border border-[#C0927C]/30 focus:border-[#C1372C] focus:outline-none focus:ring-2 focus:ring-[#C1372C]/20 transition-all duration-300 placeholder:text-[#C0927C]/40 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C0927C]/50 hover:text-[#C1372C] transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C1372C] hover:bg-[#C1372C]/90 text-white py-4 rounded-xl font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/20"
          >
            {loading ? 'Accessing...' : 'Access Account'}
          </button>
        </form>

        <div className="text-center mt-8">
          <p className="text-[#C0927C]/70">
            New to myFlix?{' '}
            <Link to="/signup" className="text-[#C1372C] hover:underline transition-colors font-bold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;