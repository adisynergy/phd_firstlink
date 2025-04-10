import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasMinLength: false
  });

  const validatePassword = (password) => {
    setPasswordValidation({
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&amp;*(),.?":{}|&lt;&gt;]/.test(password),
      hasMinLength: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (name === 'password') {
      validatePassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/auth/register`, {
        fullName: formData.name,
        email: formData.email,
        password: formData.password
      });

      // Store the tokens in localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      // Store user info
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      toast.success('Account created successfully!');
      navigate('/admission-form');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during signup');
      toast.error(error.response?.data?.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Enter your details to create your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="text-sm space-y-1">
                <p className="text-gray-500">Password must contain:</p>
                <ul className="space-y-1">
                  <li className={`flex items-center ${passwordValidation.hasUpperCase ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className="mr-1">{passwordValidation.hasUpperCase ? '✓' : '○'}</span>
                    At least one uppercase letter
                  </li>
                  <li className={`flex items-center ${passwordValidation.hasLowerCase ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className="mr-1">{passwordValidation.hasLowerCase ? '✓' : '○'}</span>
                    At least one lowercase letter
                  </li>
                  <li className={`flex items-center ${passwordValidation.hasNumber ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className="mr-1">{passwordValidation.hasNumber ? '✓' : '○'}</span>
                    At least one number
                  </li>
                  <li className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className="mr-1">{passwordValidation.hasSpecialChar ? '✓' : '○'}</span>
                    At least one special character (!@#$%^&amp;*(),.?":{}|&lt;&gt;)
                  </li>
                  <li className={`flex items-center ${passwordValidation.hasMinLength ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className="mr-1">{passwordValidation.hasMinLength ? '✓' : '○'}</span>
                    At least 8 characters long
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 