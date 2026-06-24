
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const { signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we are in recovery mode (the URL will have ?type=recovery after reset link)
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'recovery' || location.hash.includes('type=recovery')) {
      setIsRecovery(true);
      toast.info("Please set your new password");
    }

    // Also listen for Supabase events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [location]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        localStorage.setItem('gymday_auth_provider', 'email');
        navigate("/");
        toast.success("Successfully signed in!");

      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address first");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?type=recovery`,
      });
      if (error) throw error;
      toast.success("Password reset email sent! Check your inbox.");
      setIsForgotPassword(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setIsRecovery(false);
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gym-darker p-4 text-white">
      <Card className="w-full max-w-md bg-gym-card border-none shadow-xl text-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gym-blue">
            {isRecovery ? "New Password" : (isForgotPassword ? "Reset Password" : (isSignUp ? "Create Account" : "Welcome Back"))}
          </CardTitle>
          <CardDescription className="text-center text-gray-400">
            {isRecovery 
              ? "Set your new account password"
              : (isForgotPassword 
                ? "Enter your email to receive a password reset link" 
                : (isSignUp ? "Sign up to start tracking your fitness journey" : "Sign in to continue your progress"))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isRecovery ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="bg-gym-dark border-gray-700 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gym-blue hover:bg-gym-blue/90 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password
              </Button>
            </form>
          ) : isForgotPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email</Label>
                <Input
                  id="reset-email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gym-dark border-gray-700 text-white"
                />
              </div>
              <Button type="submit" className="w-full bg-gym-blue hover:bg-gym-blue/90 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Reset Link
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsForgotPassword(false)} 
                className="w-full text-gray-400 hover:text-white"
              >
                Back to Login
              </Button>
            </form>
          ) : (
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gym-dark border-gray-700 text-white"
                />
              </div>
              {!isSignUp && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button 
                      type="button" 
                      variant="link" 
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-gym-blue hover:text-gym-blue/80 p-0 h-auto"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gym-dark border-gray-700 text-white"
                  />
                </div>
              )}
              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-gym-dark border-gray-700 text-white"
                  />
                </div>
              )}
              <Button type="submit" className="w-full bg-gym-blue hover:bg-gym-blue/90 text-white" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gym-card px-2 text-gray-400 font-bold">Or continue with</span>
                </div>
              </div>

              <Button 
                type="button"
                variant="outline" 
                onClick={signInWithGoogle}
                className="w-full bg-white text-black hover:bg-gray-200"
                disabled={loading}
              >
                <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                  <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                </svg>
                {isSignUp ? "Sign up with Google" : "Sign in with Google"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center flex-col gap-2">
          {!isForgotPassword && !isRecovery && (
            <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} className="text-gym-green hover:text-gym-green/80">
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
