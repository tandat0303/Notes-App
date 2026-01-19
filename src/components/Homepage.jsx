import { Notebook } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { SignInButton } from "@clerk/clerk-react";
import hero from "../assets/hero.png";

export default function Homepage() {
  return (
    <div className="min-h-screen flex items-center justify-center text-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl px-4 py-20 grid gap-12">
        <article className="space-y-8">
          <div className="inline-block">
            <h1 className="text-4xl lg:text-7xl font-bold flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Notebook
                className="size-10 lg:size-20 drop-shadow-lg"
                style={{
                  color: "var(--color-primary)",
                }}
              />
              Notes.io
            </h1>
          </div>

          <p className="lg:text-xl text-slate-600 mt-6 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-150">
            Capture your thoughts, organize your ideas, and boost your
            productivity with my beautiful and intuitive note-taking app.
          </p>

          <div className="flex items-center justify-center mt-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <Button
              className="text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                background: "var(--gradient-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "var(--gradient-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gradient-primary)";
              }}
            >
              <SignInButton mode="modal">Get started for free</SignInButton>
            </Button>
          </div>
        </article>

        <article className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{
                background: "var(--gradient-primary)",
              }}
            ></div>
            <img
              src={hero}
              alt="App illustration"
              className="relative max-w-full rounded-2xl shadow-2xl"
            />
          </div>
        </article>
      </div>
    </div>
  );
}
