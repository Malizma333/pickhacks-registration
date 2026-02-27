import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">
          This page doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-[#44ab48] px-6 py-3 text-sm font-medium text-white transition hover:bg-[#3a9c3e]"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
