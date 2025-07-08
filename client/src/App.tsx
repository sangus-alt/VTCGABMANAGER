import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import MainLayout from "@/components/layout/main-layout";
import Dashboard from "@/pages/dashboard";
import Drivers from "@/pages/drivers";
import Vehicles from "@/pages/vehicles";
import Bookings from "@/pages/bookings";
import GpsTracking from "@/pages/gps-tracking";
import Payments from "@/pages/payments";
import Maintenance from "@/pages/maintenance";
import FuelManagement from "@/pages/fuel-management";
import Statistics from "@/pages/statistics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/drivers" component={Drivers} />
        <Route path="/vehicles" component={Vehicles} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/gps-tracking" component={GpsTracking} />
        <Route path="/payments" component={Payments} />
        <Route path="/maintenance" component={Maintenance} />
        <Route path="/fuel-management" component={FuelManagement} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
