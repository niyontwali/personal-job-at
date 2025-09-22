import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { handleError } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormInputs {
  email: string;
  password: string;
}

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticating } = useAuth();

  const onSubmit: SubmitHandler<LoginFormInputs> = async data => {
    try {
      const session = await login(data.email, data.password);

      if (session) {
        navigate('/applications');
      } else {
        toast.error('Invalid credentials. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      handleError(error);
    }
  };

  const currentYear: number = new Date().getFullYear();

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6'>
      <div className='w-full max-w-md space-y-8'>
        {/* Header */}
        <div className='text-center space-y-4'>
          <div className='mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center'>
            <Briefcase className='w-8 h-8 text-primary-foreground' />
          </div>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>Job Tracker</h1>
            <p className='text-sm text-muted-foreground mt-1'>Personal Application Tracking System</p>
          </div>
        </div>

        {/* Login Form */}
        <div className='bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl p-8'>
          <div className='text-center mb-6'>
            <h2 className='text-xl font-semibold text-gray-800'>Welcome Back</h2>
            <p className='text-sm text-gray-600 mt-1'>Access your application tracking dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
            {/* Email Field */}
            <div className='space-y-2'>
              <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
                Email Address
              </Label>
              <Input
                id='email'
                type='email'
                placeholder='Enter your email'
                className='w-full'
                disabled={isAuthenticating}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Invalid email format',
                  },
                })}
              />
              {errors.email && <p className='text-sm text-destructive'>{errors.email.message}</p>}
            </div>

            {/* Password Field */}
            <div className='space-y-2'>
              <Label htmlFor='password' className='text-sm font-medium text-gray-700'>
                Password
              </Label>
              <div className='relative'>
                <Input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Enter your password'
                  className='w-full pr-10'
                  disabled={isAuthenticating}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isAuthenticating}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50'
                >
                  {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                </button>
              </div>
              {errors.password && <p className='text-sm text-destructive'>{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type='submit'
              className='w-full'
              disabled={isAuthenticating}
              isLoading={isAuthenticating}
              loadingText='Signing you in...'
            >
              Access Applications
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div className='text-center'>
          <p className='text-xs text-muted-foreground'>
            &copy; {currentYear} John Niyontwali. Personal Application Tracker.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
