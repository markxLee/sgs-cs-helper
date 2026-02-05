import { Metadata } from "next";
import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Login | SGS CS Helper",
  description: "Sign in to SGS CS Helper",
};

/**
 * Login Page - Server Component
 * 
 * Renders the login form for authentication.
 * Accessible at /login
 */
export default function LoginPage() {
  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">
          SGS CS Helper
        </h1>
        <h2 className="mt-2 text-xl text-gray-600">
          Sign in to your account
        </h2>
      </div>
      
      <LoginForm />
    </>
  );
}
