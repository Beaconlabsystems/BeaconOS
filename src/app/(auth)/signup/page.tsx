'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { signupSchema, type SignupInput } from '@/lib/validations';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<SignupInput>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Partial<SignupInput>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate form
    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<SignupInput> = {};
      result.error.errors.forEach((error) => {
        const path = error.path[0] as keyof SignupInput;
        fieldErrors[path] = error.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          },
        },
      });

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Account created!',
        description: 'Check your email to confirm your account, then sign in.',
      });

      router.push('/login');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-beacon-950/20 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-beacon-gradient shadow-lg animate-pulse-glow">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">Beacon OS</h1>
          <p className="text-muted-foreground text-center">
            Your guiding light to ambitious goals
          </p>
        </div>

        {/* Signup Card */}
        <Card className="border-border/50 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create your account</CardTitle>
            <CardDescription className="text-center">
              Start your journey to ambitious goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Tungi"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  error={!!errors.fullName}
                  disabled={loading}
                  autoComplete="name"
                />
                {errors.fullName && (
                  <p className="text-xs text-destructive">{errors.fullName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tungi@beaconlabs.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  error={!!errors.email}
                  disabled={loading}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  error={!!errors.password}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, confirmPassword: e.target.value })
                  }
                  error={!!errors.confirmPassword}
                  disabled={loading}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-destructive">{errors.confirmPassword}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="beacon"
                size="lg"
                loading={loading}
              >
                Create Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground">
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
