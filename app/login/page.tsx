"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { signInWithGoogle, loginWithEmail, signupWithEmail } from "@/lib/auth";

import { useAuth } from "@/hooks/useAuth";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { useToast } from "@/hooks/use-toast";
import { DotLoader } from "@/components/DotLoader"; // adjust if path differs

const getAuthErrorMessage = (error: any) => {
  const code = error?.code || "";

  switch (code) {
    case "auth/email-already-in-use":
      return "This email is already registered. Please login instead.";

    case "auth/invalid-email":
      return "Invalid email format.";

    case "auth/user-not-found":
      return "No account found with this email.";

    case "auth/wrong-password":
      return "Incorrect password.";

    case "auth/weak-password":
      return "Password should be at least 6 characters.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    default:
      return "Something went wrong. Please try again.";
  }
};

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const { user, loading: authLoading } = useAuth(); // ✅ NEW

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // ===============================
  // ✅ REDIRECT IF ALREADY LOGGED IN
  // ===============================
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // ===============================
  // 🔥 EMAIL AUTH
  // ===============================
  const handleEmailAuth = async () => {
    try {
      setLoading(true);

      if (!email || !password) {
        toast({
          title: "Missing fields",
          description: "Email and password are required",
          variant: "destructive",
        });
        setLoading(false); //-
        return;
      }

      if (isSignup && !name) {
        toast({
          title: "Missing name",
          description: "Please enter your name",
          variant: "destructive",
        });
        setLoading(false); //-
        return;
      }

      if (isSignup) {
        await signupWithEmail(name, email, password);

        toast({
          title: "Account created 🎉",
          description: "Welcome! Your account has been created",
          variant: "success",
        });
      } else {
        await loginWithEmail(email, password);

        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "success",
        });
      }

      router.replace("/");
    } catch (err: any) {
      toast({
        title: "Authentication failed",
        description: getAuthErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // 🔥 GOOGLE AUTH
  // ===============================
  const handleGoogle = async () => {
    try {
      setLoading(true);

      await signInWithGoogle();

      toast({
        title: "Login successful",
        description: "Signed in with Google",
        variant: "success",
      });

      router.push("/");
    } catch (err: any) {
      toast({
        title: "Google sign-in failed",
        description: err.message || "Try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // ✅ GLOBAL AUTH LOADER (VERY IMPORTANT)
  // ===============================

  const [minLoaderDone, setMinLoaderDone] = useState(false);

  // Minimum loader timer (1s)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderDone(true), 700);
    return () => clearTimeout(timer);
  }, []);

  if (authLoading || !minLoaderDone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );
  }

  // ===============================
  // UI
  // ===============================

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-slate-950 px-4 sm:px-6 pb-40 sm:pb-0">
      <Card className="w-full max-w-[360px] sm:max-w-[400px] mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-2xl md:text-2xl">
            {isSignup ? "Create Account" : "Welcome Back"}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Name */}
          {isSignup && (
            <div>
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
            />
          </div>

          {/* Password */}
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          {/* Email Button */}
          <Button
            className="w-full"
            onClick={handleEmailAuth}
            disabled={loading}
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Login"}
          </Button>

          {/* Divider */}
          <div className="text-center text-sm text-muted-foreground">OR</div>

          {/* Google Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={handleGoogle}
            disabled={loading}
          >
            Continue with Google
          </Button>

          {/* Toggle */}
          <p className="text-sm text-center">
            {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-emerald-600 font-medium"
            >
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
