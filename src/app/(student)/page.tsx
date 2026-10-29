import { LiveProgressProvider } from "@/components/live/LiveProgressProvider";
import Dashboard from "@/components/live/Dashboard";

export default function OverviewPage() {
  return (
    <LiveProgressProvider>
      <Dashboard />
    </LiveProgressProvider>
  );
}
