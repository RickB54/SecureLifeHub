
import React, { useState } from 'react';
import { useAuth } from "@/components/auth-provider";
import { Button } from '@/components/gdft/components/ui/button';
import { User, LogOut, Lock, Key } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/gdft/components/ui/dialog';
import { Input } from '@/components/gdft/components/ui/input';

export const AccountSection = () => {
    const { user, authProvider, signInWithGoogle, signOut, loading, updatePassword } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    const handlePasswordChange = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error("Please fill in both fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        setIsUpdating(true);
        try {
            await updatePassword(newPassword);
            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (e) {
            // Error managed by AuthContext
        } finally {
            setIsUpdating(false);
        }
    };
  
    return (
      <div className="card-glass p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        
        {loading ? (
            <p className="text-gray-400">Loading account details...</p>
        ) : user ? (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20">
                        {user.email?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <p className="font-bold text-white text-lg leading-none mb-1">{user.email}</p>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {authProvider === 'google' ? 'Connected via Google' : 'Email Account'}
                        </p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                    {authProvider === 'email' && (
                        <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 rounded-xl px-5 h-10 font-bold">
                                    <Key className="mr-2 h-4 w-4 text-amber-400" /> Change Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gym-dark border-white/5 sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black flex items-center gap-2">
                                        <Lock className="h-5 w-5 text-gym-blue" />
                                        Update Password
                                    </DialogTitle>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Secure your account with a new password.
                                    </p>
                                </DialogHeader>
                                <div className="space-y-4 py-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">New Password</label>
                                        <Input 
                                            type="password" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Min. 6 characters"
                                            className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-gym-blue"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-gray-500">Confirm Password</label>
                                        <Input 
                                            type="password" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Repeat new password"
                                            className="bg-black/40 border-white/5 h-12 rounded-xl focus:ring-gym-blue"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button variant="ghost" onClick={() => setIsChangingPassword(false)} className="rounded-xl font-bold">Cancel</Button>
                                    <Button 
                                        className="bg-blue-600 hover:bg-blue-700 rounded-xl font-bold px-8 shadow-lg shadow-blue-500/20"
                                        onClick={handlePasswordChange}
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? "Updating..." : "Save New Password"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    <Button 
                        variant="destructive" 
                        onClick={signOut}
                        className="rounded-xl font-bold px-6 h-10 bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        ) : (
            <div>
                <p className="text-gray-300 mb-6">
                    Sign in to sync your workouts, templates, and metrics across devices. Your progress will be securely backed up to the cloud.
                </p>
                <div className="flex flex-col gap-3">
                     <div className="flex flex-col sm:flex-row gap-4">
                         <Button 
                            onClick={signInWithGoogle} 
                            className="bg-white text-black hover:bg-gray-200 h-12 rounded-xl font-bold flex-1 shadow-lg shadow-white/5"
                         >
                            <svg className="mr-3 h-5 w-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
                              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
                            </svg>
                            Continue with Google
                         </Button>
                         <Button
                            variant="outline"
                            className="h-12 border-white/10 bg-white/5 hover:bg-white/10 rounded-xl font-bold flex-1"
                            onClick={() => window.location.href = '/login'}
                         >
                             Email Login / Sign Up
                         </Button>
                     </div>
                </div>
            </div>
        )}
      </div>
    );
  };
