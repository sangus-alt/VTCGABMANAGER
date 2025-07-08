import { useQuery } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/use-websocket";
import { useToast } from "@/hooks/use-toast";
import KPICards from "@/components/dashboard/kpi-cards";
import RealtimeMap from "@/components/dashboard/realtime-map";
import RecentBookings from "@/components/dashboard/recent-bookings";
import DriverStatus from "@/components/dashboard/driver-status";
import MaintenanceAlerts from "@/components/dashboard/maintenance-alerts";
import PaymentSummary from "@/components/dashboard/payment-summary";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch recent bookings
  const { data: recentBookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings/recent?limit=5'],
  });

  // Fetch drivers
  const { data: drivers, isLoading: driversLoading } = useQuery({
    queryKey: ['/api/drivers'],
  });

  // Fetch maintenance alerts
  const { data: maintenanceAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['/api/maintenance-records/alerts'],
  });

  // Fetch payment summary
  const { data: paymentSummary, isLoading: paymentsLoading } = useQuery({
    queryKey: ['/api/dashboard/payment-summary'],
  });

  // WebSocket connection for real-time updates
  useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'new_booking':
          toast({
            title: "Nouvelle réservation",
            description: "Une nouvelle réservation a été créée",
          });
          break;
        case 'driver_status_update':
          toast({
            title: "Statut chauffeur mis à jour",
            description: `Le statut du chauffeur a été modifié`,
          });
          break;
        case 'gps_update':
          // Handle GPS updates silently
          break;
      }
    },
  });

  if (statsLoading || bookingsLoading || driversLoading || alertsLoading || paymentsLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <KPICards stats={stats || {
        todayCourses: 0,
        totalRevenue: 0,
        activeDrivers: 0,
        totalDrivers: 0,
        availableVehicles: 0,
        totalVehicles: 0,
      }} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealtimeMap activeVehicles={stats?.activeDrivers || 0} />
        <RecentBookings bookings={recentBookings || []} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DriverStatus drivers={drivers || []} />
        <MaintenanceAlerts alerts={maintenanceAlerts || []} />
        <PaymentSummary summary={paymentSummary || {
          cash: 0,
          mobile: 0,
          card: 0,
          total: 0,
        }} />
      </div>
    </div>
  );
}
