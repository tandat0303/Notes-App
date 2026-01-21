import React from "react";
import { Lock, Shield, Unlock } from "lucide-react";
import { Button } from "../ui/button";

export function LockedNotePreview({ note, onUnlockClick }) {
  return (
    <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="text-center max-w-md">
        <div className="relative inline-block mb-6">
          <div 
            className="absolute inset-0 rounded-full blur-xl opacity-30 animate-pulse"
            style={{
              background: 'linear-gradient(to right, #f59e0b, #ea580c)'
            }}
          ></div>
          <div 
            className="relative size-20 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              boxShadow: '0 20px 40px -10px rgba(234, 88, 12, 0.4)'
            }}
          >
            <Lock className="size-10 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Note is Locked
        </h2>
        <p className="text-slate-600 mb-2">
          <span className="font-semibold text-slate-800">"{note.title}"</span>
        </p>
        <p className="text-sm text-slate-500 mb-8">
          This note is password protected. Enter the password to view its contents.
        </p>

        <div className="space-y-3">
          <Button
            onClick={onUnlockClick}
            className="w-full text-white shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              background: 'linear-gradient(to right, #f59e0b, #ea580c)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #ea580c, #dc2626)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(to right, #f59e0b, #ea580c)';
            }}
          >
            <Unlock className="size-4 mr-2" />
            Unlock Note
          </Button>

          <div 
            className="p-3 rounded-lg border"
            style={{
              borderColor: '#fbbf24',
              backgroundColor: '#fef3c7'
            }}
          >
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <Shield className="size-4 flex-shrink-0" />
              <p>Your note content is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}