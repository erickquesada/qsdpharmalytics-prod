import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { AlertCircle, TrendingUp, Mail, Lock, User, Phone } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'analyst'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    
    if (result.success) {
      navigate('/login', { 
        state: { message: 'Registration successful! Please sign in.' } 
      });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Create your account</CardTitle>
            <CardDescription className="text-base mt-2">Join QSD Pharmalytics today</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="John"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Doe"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="pl-10 h-12"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (Optional)</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 h-12"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base bg-slate-900 hover:bg-slate-800"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
