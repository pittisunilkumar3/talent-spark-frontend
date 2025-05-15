
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);
      navigate('/dashboard');
      toast({
        title: "Success",
        description: "You have successfully logged in",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to login. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login to TalentSpark</CardTitle>
        <CardDescription>
          Enter your email and password to access your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-xs text-primary hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  toast({
                    title: "Demo Notice",
                    description: "Password reset is not available in the demo.",
                  });
                }}
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Demo accounts helper */}
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-2">Demo Accounts:</p>
            <div className="grid grid-cols-1 gap-2 text-xs">
              <p>
                <strong>CEO:</strong> ceo@talentspark.com
              </p>
              <p>
                <strong>Branch Manager:</strong> branch-manager@talentspark.com
              </p>
              <p>
                <strong>Marketing Head:</strong> marketing-head@talentspark.com
              </p>
              <p>
                <strong>Marketing Supervisor:</strong> marketing-supervisor@talentspark.com
              </p>
              <p>
                <strong>Marketing Recruiter:</strong> recruiter@talentspark.com
              </p>
              <p>
                <strong>Marketing Associate:</strong> associate@talentspark.com
              </p>
              <p>
                <strong>Applicant:</strong> applicant@example.com
              </p>
              <p className="italic">Password: any value works</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="w-full space-y-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
