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
} from "lucide-react";

export default function ShareDialog({ open, onOpenChange, note }) {
  const [copied, setCopied] = useState(false);

  const shareURL = `${window.location.origin}/shared/${note._id}`;
  const shareText = `Check out this note: ${note.title}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareURL);
      setCopied(true);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="size-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
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
          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
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
                  gap-2 transition-all duration-300 rounded-lg
                  ${copied 
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }
                `}
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
          </div>

          {/* Social Share Section */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></span>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}