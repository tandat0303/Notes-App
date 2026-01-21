import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Lock, Unlock, Eye, EyeOff, Shield } from "lucide-react";
import { Label } from "../ui/label";

export function LockNoteDialog({ open, onOpenChange, onConfirm, isLocking, noteName }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLocking && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 4) {
      toast.error("Password must be at least 4 characters");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm(password);
      setPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="size-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: isLocking 
                  ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
                  : 'var(--gradient-primary)',
                boxShadow: isLocking
                  ? '0 10px 25px -5px rgba(234, 88, 12, 0.3)'
                  : '0 10px 25px -5px var(--shadow-primary)'
              }}
            >
              {isLocking ? (
                <Lock className="size-5 text-white" />
              ) : (
                <Unlock className="size-5 text-white" />
              )}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {isLocking ? "Lock Note" : "Unlock Note"}
              </DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                {noteName && <span className="font-semibold">"{noteName}"</span>}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {isLocking && (
            <div 
              className="p-3 rounded-lg border-2 border-dashed"
              style={{
                borderColor: '#fbbf24',
                backgroundColor: '#fef3c7'
              }}
            >
              <div className="flex items-start gap-2">
                <Shield className="size-4 mt-0.5 text-amber-600 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <p>Remember this password. There is no way to recover a locked note if you forget the password.</p>
                </div>
              </div>
            </div>
          )}

          {/* Password Input */}
          <div className="space-y-2">
            <Label 
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 flex items-center gap-2"
            >
              <span 
                className="w-1 h-4 rounded-full"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              ></span>
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="pr-10"
                autoFocus
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password (only when locking) */}
          {isLocking && (
            <div className="space-y-2">
              <Label 
                htmlFor="confirmPassword"
                className="text-sm font-semibold text-slate-700"
              >
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="text-white"
              style={{
                background: isLocking 
                  ? 'linear-gradient(to right, #f59e0b, #ea580c)'
                  : 'var(--gradient-primary)'
              }}
            >
              {isLoading ? (
                "Processing..."
              ) : isLocking ? (
                <>
                  <Lock className="size-4 mr-2" />
                  Lock Note
                </>
              ) : (
                <>
                  <Unlock className="size-4 mr-2" />
                  Unlock Note
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}