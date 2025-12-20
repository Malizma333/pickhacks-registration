interface AlertMessageProps {
  type: "error" | "success" | "warning" | "info";
  message: string;
  onDismiss?: () => void;
  className?: string;
}

const alertStyles = {
  error: {
    container: "border-red-200 bg-red-50",
    icon: "text-red-500",
    text: "text-red-800",
    dismiss: "text-red-600",
  },
  success: {
    container: "border-green-200 bg-green-50",
    icon: "text-green-500",
    text: "text-green-800",
    dismiss: "text-green-600",
  },
  warning: {
    container: "border-amber-200 bg-amber-50",
    icon: "text-amber-500",
    text: "text-amber-800",
    dismiss: "text-amber-600",
  },
  info: {
    container: "border-blue-200 bg-blue-50",
    icon: "text-blue-500",
    text: "text-blue-800",
    dismiss: "text-blue-600",
  },
};

const alertIcons = {
  error: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  success: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
  warning: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  ),
  info: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  ),
};

export function AlertMessage({
  type,
  message,
  onDismiss,
  className = "",
}: AlertMessageProps) {
  const styles = alertStyles[type];

  return (
    <div
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
    >
      <div className="flex items-start gap-3">
        <svg
          className={`h-5 w-5 flex-shrink-0 mt-0.5 ${styles.icon}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {alertIcons[type]}
        </svg>
        <div className="flex-1">
          <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className={`text-xs underline hover:no-underline mt-1 ${styles.dismiss}`}
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface SuccessBannerProps {
  message: string;
  className?: string;
}

export function SuccessBanner({ message, className = "" }: SuccessBannerProps) {
  return (
    <div className={`rounded-xl border border-green-200 bg-green-50 p-6 text-center ${className}`}>
      <svg
        className="w-12 h-12 text-green-500 mx-auto mb-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <p className="text-lg font-semibold text-green-800">{message}</p>
    </div>
  );
}
