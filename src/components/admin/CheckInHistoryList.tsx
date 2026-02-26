"use client";

interface CheckIn {
  id: string;
  stationId: string;
  stationName: string;
  stationType: string;
  checkedInAt: Date;
}

interface CheckInHistoryListProps {
  checkIns: CheckIn[];
  currentStationId?: string;
}

const stationTypeColors: Record<string, string> = {
  checkin: "bg-blue-100 text-blue-700",
  food: "bg-orange-100 text-orange-700",
  workshop: "bg-purple-100 text-purple-700",
  prize: "bg-yellow-100 text-yellow-700",
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function CheckInHistoryList({
  checkIns,
  currentStationId,
}: CheckInHistoryListProps) {
  if (checkIns.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500 text-sm">
        No check-ins yet
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Check-in History</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {checkIns.map((checkIn) => {
          const isCurrentStation = checkIn.stationId === currentStationId;

          return (
            <div
              key={checkIn.id}
              className={`flex items-center justify-between p-3 rounded-lg ${
                isCurrentStation
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${
                    stationTypeColors[checkIn.stationType] ?? "bg-gray-100 text-gray-700"
                  }`}
                >
                  {checkIn.stationName}
                </span>
                {isCurrentStation && (
                  <span className="text-xs text-amber-600 font-medium">
                    (This station)
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {formatRelativeTime(checkIn.checkedInAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
