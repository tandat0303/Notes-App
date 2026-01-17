import { UserButton, useUser } from "@clerk/clerk-react";
import { ArrowLeft, User, Palette, Type, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { toast } from "sonner";

export default function SettingsView() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();

  const colorThemes = [
    { value: "blue", label: "Blue", color: "bg-blue-600", ring: "ring-blue-600" },
    { value: "green", label: "Green", color: "bg-green-600", ring: "ring-green-600" },
    { value: "purple", label: "Purple", color: "bg-purple-600", ring: "ring-purple-600" },
    { value: "orange", label: "Orange", color: "bg-orange-600", ring: "ring-orange-600" },
    { value: "red", label: "Red", color: "bg-red-600", ring: "ring-red-600" },
    { value: "pink", label: "Pink", color: "bg-pink-600", ring: "ring-pink-600" },
    { value: "teal", label: "Teal", color: "bg-teal-600", ring: "ring-teal-600" },
    { value: "yellow", label: "Yellow", color: "bg-yellow-500", ring: "ring-yellow-500" },
    { value: "indigo", label: "Indigo", color: "bg-indigo-600", ring: "ring-indigo-600" },
    { value: "cyan", label: "Cyan", color: "bg-cyan-600", ring: "ring-cyan-600" },
    { value: "slate", label: "Slate", color: "bg-slate-600", ring: "ring-slate-600" },
  ];

  const fontThemes = [
    { value: "inter", label: "Inter", preview: "Aa" },
    { value: "roboto", label: "Roboto", preview: "Aa" },
    { value: "poppins", label: "Poppins", preview: "Aa" },
    { value: "geist", label: "Geist", preview: "Aa" },
    { value: "catamaran", label: "Catamaran", preview: "Aa" },
    { value: "mono", label: "Monospace", preview: "Aa" },
  ];

  const handleColorThemeChange = async (value) => {
    try {
      await setTheme({ colorTheme: value });
      toast.success("Color theme updated successfully!");
    } catch {
      toast.error("Failed to update color theme");
    }
  };

  const handleFontThemeChange = async (value) => {
    try {
      await setTheme({ fontTheme: value });
      toast.success("Font theme updated successfully!");
    } catch {
      toast.error("Failed to update font theme");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-auto">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 bg-white/80 backdrop-blur-lg sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="gap-2 text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>

          <UserButton />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* User profile */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="size-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="size-4 text-white" />
                </div>
                Profile
              </CardTitle>
              <CardDescription className="text-slate-600">
                Your account information
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <Label className="text-sm font-semibold text-slate-700">Name</Label>
                  <p className="text-slate-900 mt-1 font-medium">
                    {user?.fullName || "Not set"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <Label className="text-sm font-semibold text-slate-700">Email</Label>
                  <p className="text-slate-900 mt-1 font-medium">
                    {user?.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color theme */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="size-8 bg-gradient-to-br from-pink-500 to-rose-500 rounded-lg flex items-center justify-center">
                  <Palette className="size-4 text-white" />
                </div>
                Color Theme
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose your preferred color scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme.colorTheme}
                onValueChange={handleColorThemeChange}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {colorThemes.map((colorTheme) => (
                  <label
                    key={colorTheme.value}
                    htmlFor={`color-${colorTheme.value}`}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${theme.colorTheme === colorTheme.value 
                        ? 'border-current shadow-md bg-slate-50' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <RadioGroupItem
                      value={colorTheme.value}
                      id={`color-${colorTheme.value}`}
                      className="hidden"
                    />
                    <div className={`
                      size-6 rounded-full ${colorTheme.color} 
                      ${theme.colorTheme === colorTheme.value ? 'ring-2 ring-offset-2 ' + colorTheme.ring : ''}
                      transition-all duration-200
                    `} />
                    <span className={`
                      font-medium text-sm
                      ${theme.colorTheme === colorTheme.value ? 'text-slate-900' : 'text-slate-600'}
                    `}>
                      {colorTheme.label}
                    </span>
                    {theme.colorTheme === colorTheme.value && (
                      <Sparkles className="size-4 ml-auto text-amber-500" />
                    )}
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Font theme */}
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <div className="size-8 bg-gradient-to-br from-violet-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Type className="size-4 text-white" />
                </div>
                Font Theme
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose your preferred typography style
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme.fontTheme}
                onValueChange={handleFontThemeChange}
                className="grid grid-cols-2 md:grid-cols-3 gap-3"
              >
                {fontThemes.map((fontTheme) => (
                  <label
                    key={fontTheme.value}
                    htmlFor={`font-${fontTheme.value}`}
                    className={`
                      flex flex-col items-center gap-2 p-4 rounded-lg border-2 cursor-pointer
                      transition-all duration-200 hover:scale-105
                      ${theme.fontTheme === fontTheme.value 
                        ? 'border-blue-500 shadow-md bg-blue-50' 
                        : 'border-slate-200 hover:border-slate-300'
                      }
                    `}
                  >
                    <RadioGroupItem
                      value={fontTheme.value}
                      id={`font-${fontTheme.value}`}
                      className="hidden"
                    />
                    <div className={`
                      text-3xl font-bold
                      ${theme.fontTheme === fontTheme.value ? 'text-blue-600' : 'text-slate-400'}
                      transition-colors duration-200
                    `}>
                      {fontTheme.preview}
                    </div>
                    <span className={`
                      font-medium text-sm
                      ${theme.fontTheme === fontTheme.value ? 'text-slate-900' : 'text-slate-600'}
                    `}>
                      {fontTheme.label}
                    </span>
                    {theme.fontTheme === fontTheme.value && (
                      <Sparkles className="size-4 text-amber-500" />
                    )}
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}