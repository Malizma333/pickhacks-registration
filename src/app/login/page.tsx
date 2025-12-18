import { AuthForm } from "~/components/auth/AuthForm";
import { Logo } from "~/components/ui/Logo";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f4e5] p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex justify-center">
          <div className="w-64">
            <Logo variant="text" width={256} />
          </div>
        </div>

        <AuthForm />
      </div>
    </main>
  );
}
