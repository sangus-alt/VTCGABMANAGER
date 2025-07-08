import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Wrench, Car } from "lucide-react";

interface MaintenanceAlert {
  id: number;
  type: string;
  description: string;
  vehicle: {
    licensePlate: string;
    make: string;
    model: string;
  };
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
}

interface MaintenanceAlertsProps {
  alerts: MaintenanceAlert[];
}

export default function MaintenanceAlerts({ alerts }: MaintenanceAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'oil_change':
        return AlertTriangle;
      case 'tire_change':
        return Car;
      default:
        return Wrench;
    }
  };

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200';
      case 'medium':
        return 'bg-orange-50 border-orange-200';
      case 'low':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getIconColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-orange-500';
      case 'low':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'oil_change':
        return 'Vidange urgente';
      case 'tire_change':
        return 'Changement de pneus';
      case 'brake_service':
        return 'Service des freins';
      default:
        return 'Maintenance';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Alertes Maintenance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">
              Aucune alerte de maintenance
            </p>
          ) : (
            alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getAlertColor(alert.priority)}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${getIconColor(alert.priority)}`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {getTypeText(alert.type)}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {alert.vehicle.licensePlate} - {alert.vehicle.make} {alert.vehicle.model}
                    </p>
                    <p className="text-xs text-text-secondary">{alert.description}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
