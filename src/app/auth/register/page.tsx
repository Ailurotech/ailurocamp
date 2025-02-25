import AuthForm from '@/components/ui/AuthForm';
import { Metadata } from 'next';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Register - LMS',
  description: 'Create a new account for the Learning Management System',
};

export default function RegisterPage() {
  return (
    <Suspense>
      <AuthForm mode="register" />
    </Suspense>
  );
}
