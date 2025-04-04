import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import Layout from '@/components/Layout';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [studentNumber, setStudentNumber] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNetworkError(false);
    
    if (!studentNumber || !name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive"
      });
      return;
    }
    
    if (!email.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register(studentNumber, name, email, password);
      setSuccess(true);
      setStudentNumber('');
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error(error);
      // Check for network error specifically
      if (error.code === 'auth/network-request-failed') {
        setNetworkError(true);
      } else {
        toast({
          title: "Registration failed",
          description: error instanceof Error ? error.message : "There was an error creating your account",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = () => {
    setNetworkError(false);
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  const logo = (
    <div className="flex items-center justify-center mb-6">
      <img 
        src="/lovable-uploads/ed1f3f9a-22a0-42de-a8cb-354fb8c82dae.png" 
        alt="Fraser Pay" 
        className="w-48 h-auto" 
      />
    </div>
  );

  return (
    <Layout showBack title="Create Account">
      <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
        {logo}
        
        <div className="w-full max-w-md mx-auto">
          <Card className="border-none shadow-lg glass-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
              <CardDescription className="text-center">
                Enter your information to create an account
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {networkError ? (
                <div className="space-y-4">
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-700">
                      <p className="font-semibold mb-2">Network connection error</p>
                      <p>Unable to connect to authentication server. Please check your internet connection and try again.</p>
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center">
                    <Button
                      onClick={retryConnection}
                      className="bg-brand-600 hover:bg-brand-700"
                    >
                      Retry Connection
                    </Button>
                  </div>
                </div>
              ) : success ? (
                <div className="space-y-4">
                  <Alert className="bg-green-50 border-green-200">
                    <InfoIcon className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <p className="font-semibold mb-2">Registration successful!</p>
                      <p>Please check your email for a confirmation link to verify your account.</p>
                      <p className="mt-2">Once verified, you'll be able to log in to your account.</p>
                    </AlertDescription>
                  </Alert>
                  <div className="flex justify-center">
                    <Button
                      onClick={() => navigate('/login')}
                      className="bg-brand-600 hover:bg-brand-700"
                    >
                      Go to Login
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentNumber">Student Number</Label>
                    <Input
                      id="studentNumber"
                      type="text"
                      placeholder="Enter your student number"
                      value={studentNumber}
                      onChange={(e) => setStudentNumber(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                      className="bg-white/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="bg-white/50 pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                        tabIndex={-1}
                      >
                        {showPassword ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        required
                        className="bg-white/50 pr-10"
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? 
                          <EyeOff className="h-4 w-4" /> : 
                          <Eye className="h-4 w-4" />
                        }
                      </button>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-brand-600 hover:bg-brand-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter>
              <div className="text-sm text-center w-full text-muted-foreground">
                <span>Already have an account? </span>
                <Link to="/login" className="text-brand-600 hover:underline">
                  Sign in
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
