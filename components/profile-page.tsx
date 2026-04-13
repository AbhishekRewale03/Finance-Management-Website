"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  UserProfile,
  getUserProfile,
  saveUserProfile,
} from "@/services/user.service";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SaveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DotLoader } from "./DotLoader";
import { useRouter } from "next/navigation";

export function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  // ✅ FIX 1: add uid
  const [profile, setProfile] = useState<UserProfile>({
    uid: "",
    name: "",
    email: "",
    phone: "",
    dob: "",
  });

  const [saving, setSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  // 🔥 Load profile
  useEffect(() => {
    if (!user) return;

    const loadProfile = async () => {
      try {
        const data = await getUserProfile(user.uid);

        if (data) {
          // ✅ FIX 2: include uid
          setProfile({
            uid: user.uid,
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? "",
            dob: data.dob ?? "",
          });
        } else {
          // ✅ FIX 3: include uid
          setProfile({
            uid: user.uid,
            name: user.displayName ?? "",
            email: user.email ?? "",
            phone: "",
            dob: "",
          });
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // ✅ Better loading UI

  const [minLoaderDone, setMinLoaderDone] = useState(false);

  // Minimum loader timer (1s)
  useEffect(() => {
    const timer = setTimeout(() => setMinLoaderDone(true), 700);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login");
  }, [authLoading, user, router]);

  if (authLoading || profileLoading || !minLoaderDone)
    return (
      <div className="flex items-center justify-center h-screen">
        <DotLoader size={12} className="text-emerald-500" />
      </div>
    );

  if (!user) return null;

  // 🔥 Save
  const handleSave = async () => {
    try {
      setSaving(true);

      await saveUserProfile(user.uid, profile);

      toast({
        title: "Profile updated",
        description: "Your changes have been saved successfully",
        variant: "success",
      });
    } catch (err) {
      console.error(err);

      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-3 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Manage your account
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
        {/* Avatar Card */}
        <Card className="md:w-1/3">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Your account
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
              <AvatarFallback>
                {(profile.name || "U").charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <p className="text-xs sm:text-sm text-muted-foreground text-center break-all">
              {profile.email || "No email"}
            </p>
          </CardContent>
        </Card>

        {/* Form Card */}
        <Card className="md:w-2/3">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Personal Info</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Update your details
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 sm:gap-4">
              {/* Name */}
              <div className="min-w-0">
                <Label className="text-sm sm:text-base">Name</Label>
                <Input
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full text-sm sm:text-base"
                />
              </div>

              {/* Email */}
              <div className="min-w-0">
                <Label className="text-sm sm:text-base">Email</Label>
                <Input
                  value={profile.email}
                  disabled
                  className="w-full text-sm sm:text-base"
                />
              </div>

              {/* Phone */}
              <div className="min-w-0">
                <Label className="text-sm sm:text-base">Phone</Label>
                <Input
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full text-sm sm:text-base"
                />
              </div>

              {/* DOB */}
              <div className="min-w-0">
                <Label className="text-sm sm:text-base">Date of Birth</Label>
                <Input
                  type="date"
                  value={profile.dob}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      dob: e.target.value,
                    }))
                  }
                  className="w-full text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-40 mx-auto text-sm sm:text-base mt-4"
            >
              <SaveIcon className="mr-2 h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
