export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f4e5] p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-6 w-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-[#074c72]">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We&apos;ve sent a verification link to your email address. Please
            check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="mt-6 rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Didn&apos;t receive the email?
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Check your spam folder, or contact us at{" "}
                  <a
                    href="mailto:hello@pickhacks.io"
                    className="font-medium underline"
                  >
                    hello@pickhacks.io
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <a
            href="/login"
            className="text-sm text-[#074c72] hover:text-[#44ab48] hover:underline"
          >
            Back to login
          </a>
        </div>
      </div>
    </main>
  );
}
