import AuthForm from '@/components/ui/AuthForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - LMS',
  description: 'Sign in to your Learning Management System account',
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
