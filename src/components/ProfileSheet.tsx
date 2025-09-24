import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { Mail, Phone, Shield, Calendar, Key, Eye, EyeOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateWithOrdinal, handleError } from '@/lib/utils';
import { AuthService } from '@/appwrite/auth';

interface PasswordChangeInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileSheet = ({ isOpen, onClose }: ProfileSheetProps) => {
  const { user } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const authService = new AuthService();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PasswordChangeInputs>();

  const newPassword = watch('newPassword');

  const onPasswordSubmit: SubmitHandler<PasswordChangeInputs> = async data => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (data.currentPassword === data.newPassword) {
      toast.error('New password must be different from your current password');
      return;
    }

    try {
      setIsChangingPassword(true);

      try {
        await authService.updatePassword(data.newPassword, data.currentPassword);
        toast.success('Password changed successfully');
        reset();

        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
      } catch (authError) {
        handleError(authError);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getVerificationBadge = (isVerified: boolean | undefined, hasValue: boolean = true) => {
    if (!hasValue) return null;

    if (isVerified) {
      return (
        <Badge variant='outline' className='text-xs font-medium text-emerald-700 bg-emerald-50 border-emerald-200'>
          <CheckCircle className='w-3 h-3 mr-1' />
          Verified
        </Badge>
      );
    }

    return (
      <Badge variant='outline' className='text-xs font-medium text-amber-700 bg-amber-50 border-amber-200'>
        <AlertTriangle className='w-3 h-3 mr-1' />
        Unverified
      </Badge>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='w-full sm:max-w-lg overflow-y-auto'>
        <SheetHeader>
          <SheetTitle>Account Settings</SheetTitle>
          <SheetDescription>Manage your account information and security preferences</SheetDescription>
        </SheetHeader>

        <div className='px-6 '>
          <Tabs defaultValue='profile' className='w-full space-y-6'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='profile'>Profile</TabsTrigger>
              <TabsTrigger value='security'>Security</TabsTrigger>
            </TabsList>

            <TabsContent value='profile' className='space-y-6'>
              {/* User Profile Header */}
              <div className='flex items-start space-x-4 py-2'>
                <div className='w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0'>
                  <span className='text-2xl font-semibold text-gray-700'>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className='flex-1 min-w-0'>
                  <h3 className='text-xl font-semibold mb-2'>{user?.name || 'User'}</h3>
                  <div className='flex flex-wrap items-center gap-2'>
                    {user?.labels?.includes('admin') && <Badge>Administrator</Badge>}
                    <Badge
                      variant='outline'
                      className={
                        user?.status
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : 'text-red-700 bg-red-50 border-red-200'
                      }
                    >
                      <Shield className='w-3 h-3 mr-1' />
                      {user?.status ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>Your primary contact details</CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='space-y-3'>
                    <div className='flex items-center text-sm font-medium'>
                      <Mail className='w-4 h-4 mr-2' />
                      Email Address
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-mono text-sm bg-muted px-3 py-2 rounded-md flex-1 mr-3'>{user?.email}</span>
                      {getVerificationBadge(user?.emailVerification)}
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='flex items-center text-sm font-medium'>
                      <Phone className='w-4 h-4 mr-2' />
                      Phone Number
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='font-mono text-sm bg-muted px-3 py-2 rounded-md flex-1 mr-3'>
                        {user?.phone || 'Not provided'}
                      </span>
                      {user?.phone && getVerificationBadge(user?.phoneVerification, !!user.phone)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Account Details</CardTitle>
                  <CardDescription>Important account information</CardDescription>
                </CardHeader>
                <CardContent className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <div className='flex items-center text-sm font-medium'>
                      <Calendar className='w-4 h-4 mr-2' />
                      Member Since
                    </div>
                    <p className='text-sm'>
                      {user?.registration ? formatDateWithOrdinal(user.registration) : 'Unknown'}
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <div className='flex items-center text-sm font-medium'>
                      <Key className='w-4 h-4 mr-2' />
                      Password Updated
                    </div>
                    <p className='text-sm'>
                      {user?.passwordUpdate ? formatDateWithOrdinal(user.passwordUpdate) : 'Unknown'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='security' className='space-y-6'>
              {/* Change Password */}
              <Card className='border-0 shadow-sm bg-white'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-lg font-medium text-gray-900'>Change Password</CardTitle>
                  <CardDescription className='text-gray-600'>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onPasswordSubmit)} className='space-y-5'>
                    <div className='space-y-2'>
                      <Label htmlFor='currentPassword' className='text-sm font-medium text-gray-700'>
                        Current Password
                      </Label>
                      <div className='relative'>
                        <Input
                          id='currentPassword'
                          type={showCurrentPassword ? 'text' : 'password'}
                          placeholder='Enter your current password'
                          className='pr-10 bg-white border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                          {...register('currentPassword', {
                            required: 'Current password is required',
                          })}
                        />
                        <button
                          type='button'
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                        >
                          {showCurrentPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className='text-sm text-red-600 flex items-center'>
                          <AlertTriangle className='w-3 h-3 mr-1' />
                          {errors.currentPassword.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='newPassword' className='text-sm font-medium text-gray-700'>
                        New Password
                      </Label>
                      <div className='relative'>
                        <Input
                          id='newPassword'
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder='Enter your new password'
                          className='pr-10 bg-white border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                          {...register('newPassword', {
                            required: 'New password is required',
                            minLength: {
                              value: 8,
                              message: 'Password must be at least 8 characters',
                            },
                            pattern: {
                              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/,
                              message: 'Password must include lowercase, uppercase, number and special character',
                            },
                          })}
                        />
                        <button
                          type='button'
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                        >
                          {showNewPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className='text-sm text-red-600 flex items-center'>
                          <AlertTriangle className='w-3 h-3 mr-1' />
                          {errors.newPassword.message}
                        </p>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>
                        Confirm New Password
                      </Label>
                      <div className='relative'>
                        <Input
                          id='confirmPassword'
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='Confirm your new password'
                          className='pr-10 bg-white border-gray-300 focus:border-gray-900 focus:ring-gray-900'
                          {...register('confirmPassword', {
                            required: 'Please confirm your password',
                            validate: value => value === newPassword || "Passwords don't match",
                          })}
                        />
                        <button
                          type='button'
                          className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                        >
                          {showConfirmPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className='text-sm text-red-600 flex items-center'>
                          <AlertTriangle className='w-3 h-3 mr-1' />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className='pt-2'>
                      <Button
                        type='submit'
                        disabled={isChangingPassword}
                        className='bg-gray-900 hover:bg-gray-800 text-white px-6'
                      >
                        {isChangingPassword ? (
                          <>
                            <RefreshCw className='w-4 h-4 animate-spin' />
                            Updating Password...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
