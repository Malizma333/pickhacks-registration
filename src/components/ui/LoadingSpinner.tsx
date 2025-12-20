interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-8 w-8 border-4",
  lg: "h-12 w-12 border-4",
};

export function LoadingSpinner({ size = "md", className = "" }: LoadingSpinnerProps) {
  return (
    <div
      className={`inline-block animate-spin rounded-full border-solid border-[#44ab48] border-r-transparent ${sizeClasses[size]} ${className}`}
    />
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="md" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
