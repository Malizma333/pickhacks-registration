import Link from "next/link";
import { Button } from "~/components/ui/Button";
import { Divider } from "~/components/ui/Divider";
import { FormInput } from "~/components/ui/FormInput";
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

        <form className="space-y-4">
          <div>
            <FormInput type="email" name="email" placeholder="Email" />
          </div>

          <div>
            <FormInput
              type="password"
              name="password"
              placeholder="Password"
              bgColor="bg-[#e8f0f8]"
            />
          </div>

          <div>
            <Button type="submit" variant="primary" fullWidth>
              Sign In
            </Button>
          </div>

          <Divider text="or" bgColor="bg-[#e8f4e5]" />

          <div className="text-center">
            <Link
              href="/signup"
              className="text-[#2d6a86] hover:text-[#1f4d5e] hover:underline"
            >
              Create an account
            </Link>
          </div>
        </form>

        <div className="text-center">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </main>
  );
}
