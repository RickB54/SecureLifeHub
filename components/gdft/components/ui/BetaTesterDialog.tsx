import * as React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "./dialog";
import { Button } from "./button";
import { Textarea } from "./textarea";
import { Input } from "./input";
import { toast } from "sonner";
import { 
  Sparkles, MousePointerClick, Mail, Edit3, 
  RefreshCw, ExternalLink, ArrowRight, ArrowLeft, CheckCircle, Copy, Send
} from "lucide-react";

interface BetaTesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BetaTesterDialog({ open, onOpenChange }: BetaTesterDialogProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset view when dialog closes
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setShowForm(false);
        setIsSubmitted(false);
      }, 300);
    }
  }, [open]);

  const handleSubmit = () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const subject = `🚀 GymDay Beta: ${name || 'New Tester'}`;
    const body = 
      `Hi Rick,\n\n` +
      `I want to join the Beta Program!\n\n` +
      `MY INFO:\n` +
      `- Name: ${name || 'N/A'}\n` +
      `- Email: ${email}\n` +
      `- ID: BTA-${Math.floor(1000 + Math.random() * 9000)}\n\n` +
      (suggestions ? `FEEDBACK:\n"${suggestions}"\n\n` : '') +
      `Excited to help!\n\n` +
      `${name || 'Beta Tester'}`;

    // 1. Copy to clipboard as a bulletproof backup
    try {
      navigator.clipboard.writeText(body);
      toast.success('Vision copied to clipboard (Backup)!');
    } catch (err) {
      console.error('Clipboard fail:', err);
    }

    // Finalize record (Upsert logic: Update if email exists, otherwise Add)
    // Perform save BEFORE launching mail to ensure history is captured
    const existingRoster = JSON.parse(localStorage.getItem('gymday_beta_roster') || '[]');
    const existingIndex = existingRoster.findIndex(tester => tester.email.toLowerCase() === email.toLowerCase());
    const testerId = existingIndex >= 0 ? existingRoster[existingIndex].id : `BTA-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const updatedRecord = {
      name: name || 'Anonymous Tester',
      email: email,
      suggestions: suggestions || 'No suggestions provided.',
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
      status: existingIndex >= 0 && existingRoster[existingIndex].status !== 'Candidate' 
              ? existingRoster[existingIndex].status 
              : 'Candidate',
      id: testerId,
      isArchived: false,
      mailOpened: true
    };

    let updatedRoster;
    if (existingIndex >= 0) {
      updatedRoster = [...existingRoster];
      updatedRoster[existingIndex] = updatedRecord;
    } else {
      updatedRoster = [...existingRoster, updatedRecord];
    }
    
    localStorage.setItem('gymday_beta_roster', JSON.stringify(updatedRoster));
    
    // Dispatch custom event with ID to notify Settings.tsx and auto-expand
    window.dispatchEvent(new CustomEvent('gymday_beta_roster_update', { 
      detail: { expandedId: testerId } 
    }));

    // Switch to success view instead of redirecting
    setIsSubmitted(true);
    
    toast.success("Vision Recorded & Copied to Clipboard!", {
      duration: 5000,
      icon: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-gym-darker border-white/10 p-0 overflow-hidden shadow-2xl transition-all duration-500">
        {!showForm ? (
          <>
            {/* Instructions View */}
            <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-gym-blue/20 to-indigo-600/20 border-b border-white/5">
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase flex items-center gap-3 text-white">
                <Sparkles className="h-7 w-7 text-gym-blue animate-pulse-slow" />
                Beta Program Guide
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-medium">
                Follow these steps to help us shape the future of GymDay.
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-8 pb-4 space-y-6">
              <div className="space-y-5">
                <div className="flex gap-4 items-start group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center font-black text-blue-400 group-hover:scale-110 transition-transform">
                    <MousePointerClick className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Step 1: Initialize</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">Port your active email address into the official signup form.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Step 2: Authenticate</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">Share your innovative suggestions, feature requests, or bug reports.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start group">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-black text-emerald-400 group-hover:scale-110 transition-transform">
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-tight">Step 3: Contribute</p>
                    <p className="text-xs text-gray-400 leading-relaxed font-medium">Hit submit to record your vision and copy it to your clipboard for manual sending.</p>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner group transition-colors hover:border-gym-blue/30 relative">
                <div className="absolute inset-0 bg-gym-blue/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase text-gym-blue mb-4 tracking-[0.2em] relative">
                  <RefreshCw className="h-3 w-3 animate-spin-slow" />
                  Submission Resilience
                </h4>
                <div className="mt-5 pt-5 border-t border-white/5 flex items-start gap-4 relative">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <ExternalLink className="h-5 w-5 text-amber-500" />
                  </div>
                  <div className="text-[10px] text-gray-500 font-medium uppercase leading-relaxed pt-0.5">
                    Alternatively, message us directly: <br/>
                    <a 
                      href={`mailto:RicksAppServices@gmail.com?subject=${encodeURIComponent("Beta Tester Program Inquiry")}`}
                      className="text-white font-black text-sm block mt-1 hover:text-gym-blue transition-colors cursor-pointer"
                    >
                      RicksAppServices@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-black/40 border-t border-white/5">
              <Button 
                onClick={() => setShowForm(true)}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-gym-blue hover:bg-gym-blue/90 shadow-lg shadow-blue-500/20 gap-2"
              >
                Join Beta Program <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogFooter>
          </>
        ) : isSubmitted ? (
          <>
            {/* Success/Final Step View */}
            <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-emerald-600/20 to-teal-600/20 border-b border-white/5 text-center">
              <div className="h-20 w-20 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <DialogTitle className="text-3xl font-black italic tracking-tighter uppercase text-white">
                Vision Recorded!
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-medium">
                Your application has been saved to the local roster.
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gym-blue tracking-[0.2em] flex items-center gap-2">
                  <Send className="h-3 w-3" />
                  Final Step: Manual Send
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed font-medium">
                  Because some devices block automatic emails, we've copied your application to your 
                  <span className="text-white font-bold px-1">clipboard</span> for safety.
                </p>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-black text-xs">1</div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase">Open your Gmail or Mail App</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-black text-xs">2</div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase">Paste into a new message</p>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/5">
                    <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-white font-black text-xs">3</div>
                    <p className="text-[10px] font-bold text-gray-300 uppercase truncate">Send to RicksAppServices@gmail.com</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <a 
                  href="mailto:RicksAppServices@gmail.com"
                  className="text-[10px] font-black uppercase text-gym-blue hover:text-white transition-colors underline underline-offset-4"
                >
                  Try opening mail app anyway
                </a>
              </div>
            </div>

            <DialogFooter className="p-6 bg-black/40 border-t border-white/5">
              <Button 
                onClick={() => onOpenChange(false)}
                className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20"
              >
                Finished
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            {/* Form View */}
            <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-b border-white/5 relative">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowForm(false)}
                className="absolute left-4 top-4 h-8 w-8 text-gray-400 hover:text-white hover:bg-white/5 rounded-full"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase text-white text-center mt-2">
                Beta Application
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-medium text-center">
                Tell us about your fitness workflow
              </DialogDescription>
            </DialogHeader>

            <div className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Your Full Name</label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-purple-500/50 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Official Email Address</label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="h-12 bg-white/5 border-white/10 rounded-xl focus:ring-purple-500/50 text-white placeholder:text-gray-600"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="suggestions" className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    Suggestions & Feedback
                  </label>
                  <Textarea
                    id="suggestions"
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="What features would you like to see?"
                    className="min-h-[120px] bg-white/5 border-white/10 rounded-xl focus:ring-purple-500/50 text-white placeholder:text-gray-600 resize-none pt-4"
                    maxLength={500}
                  />
                  <div className="text-[10px] font-bold text-gray-600 text-right pr-2">
                    {suggestions.length} / 500 CHARACTERS
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => setShowForm(false)}
                className="flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] text-gray-400 hover:bg-white/5 hover:text-white"
              >
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-[2] h-12 rounded-xl font-black uppercase tracking-widest text-xs bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-500/20"
              >
                Submit Application
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}