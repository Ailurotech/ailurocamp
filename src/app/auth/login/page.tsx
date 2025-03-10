import AuthForm from '@/components/ui/AuthForm';
import { Metadata } from 'next';
import { Suspense } from 'react';
import LoadingController from '@/components/ui/LoadingController';

export const metadata: Metadata = {
  title: 'Sign In - LMS',
  description: 'Sign in to your Learning Management System account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingController />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
