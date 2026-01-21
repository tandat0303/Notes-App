import React, { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  Copy,
  Check,
  Facebook,
  Linkedin,
  Twitter,
  Share2,
  ExternalLink,
  Eye,
  Globe,
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function ShareDialog({ open, onOpenChange, note }) {
  const [copied, setCopied] = useState(false);

  const shareURL = `${window.location.origin}/shared/${note._id}`;
  const shareText = `Check out this note: ${note.title}`;

  const updateShareNote = useMutation(api.notes.updateSharedNote);

  if (!note) return null; 

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
      await updateShareNote({
        id: note._id,
      })
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareOnSocial = (platform) => {
    const encodedURL = encodeURIComponent(shareURL);
    const encodedText = encodeURIComponent(shareText);

    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedURL}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedURL}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
    }
  };

  const openPreview = () => {
    window.open(shareURL, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="size-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: '0 10px 25px -5px var(--shadow-primary)'
              }}
            >
              <Share2 className="size-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">Share Note</DialogTitle>
              <DialogDescription className="text-slate-600 mt-1">
                Share <span className="font-semibold text-slate-800">"{note.title}"</span> with others
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Public Access Notice */}
          <div 
            className="p-4 rounded-lg border-2 border-dashed"
            style={{
              borderColor: 'var(--color-primary-200)',
              backgroundColor: 'var(--color-primary-50)'
            }}
          >
            <div className="flex items-start gap-3">
              <Globe 
                className="size-5 mt-0.5 flex-shrink-0"
                style={{ color: 'var(--color-primary)' }}
              />
              <div>
                <p 
                  className="font-semibold text-sm mb-1"
                  style={{ color: 'var(--color-primary-dark)' }}
                >
                  Public Access
                </p>
                <p className="text-xs text-slate-600">
                  Anyone with this link can view your note. They don't need an account.
                </p>
              </div>
            </div>
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span 
                className="w-1 h-4 rounded-full"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              ></span>
              Share Link
            </label>
            <div className="flex items-center gap-2">
              <Input 
                value={shareURL} 
                readOnly 
                className="flex-1 bg-slate-50 border-slate-300 text-slate-700 font-mono text-xs rounded-lg"
              />

              <Button 
                size="sm" 
                onClick={copyToClipboard} 
                className={`
                  gap-2 transition-all duration-300 rounded-lg text-white
                  ${copied 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                    : ''
                  }
                `}
                style={!copied ? {
                  background: 'var(--gradient-primary)'
                } : {}}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = 'var(--gradient-primary-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = 'var(--gradient-primary)';
                  }
                }}
              >
                {copied ? (
                  <>
                    <Check className="size-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>

            {/* Preview Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={openPreview}
              className="w-full gap-2 border-slate-300 hover:bg-slate-50 mt-2"
            >
              <Eye className="size-4" />
              Preview Shared Note
              <ExternalLink className="size-3 ml-auto" />
            </Button>
          </div>

          {/* Social Share Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span 
                className="w-1 h-4 rounded-full"
                style={{
                  background: 'var(--gradient-primary)'
                }}
              ></span>
              Share on Social Media
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => shareOnSocial("twitter")}
                className="flex-col h-20 gap-2 border-slate-300 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 rounded-lg group"
              >
                <div className="size-8 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Twitter className="size-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700">Twitter</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareOnSocial("facebook")}
                className="flex-col h-20 gap-2 border-slate-300 hover:border-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg group"
              >
                <div className="size-8 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Facebook className="size-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700">Facebook</span>
              </Button>
              
              <Button
                variant="outline"
                onClick={() => shareOnSocial("linkedin")}
                className="flex-col h-20 gap-2 border-slate-300 hover:border-blue-700 hover:bg-blue-50 transition-all duration-200 rounded-lg group"
              >
                <div className="size-8 bg-blue-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Linkedin className="size-4 text-white" />
                </div>
                <span className="text-xs font-medium text-slate-700">LinkedIn</span>
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-200">
            <p className="flex items-center gap-1">
              💡 <span className="font-medium">Tip:</span> The shared note will always show the latest version.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}