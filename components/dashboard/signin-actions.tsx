"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const SignInActions = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailSignIn = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      if (result?.error) {
        setMessage(result.error);
      } else {
        setMessage("Check your inbox for a magic link.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Unexpected error. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            id="email"
            placeholder="you@company.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="flex-1"
          />
          <Button
            className="flex-1 gap-2"
            onClick={handleEmailSignIn}
            disabled={isLoading || !email}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            Send link
          </Button>
        </div>
        {message && (
          <p className="text-xs text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3.5 w-3.5" />
            {message}
          </p>
        )}
      </div>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </Button>
    </div>
  );
};

