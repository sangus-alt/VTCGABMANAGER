import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Circle, User } from "lucide-react";

interface Driver {
  id: number;
  user: {
    firstName: string;
    lastName: string;
    photoUrl?: string;
  };
  status: string;
  // Add vehicle license plate for display
  vehicleLicensePlate?: string;
}

interface DriverStatusProps {
  drivers: Driver[];
}

export default function DriverStatus({ drivers }: DriverStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-orange-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'En ligne';
      case 'busy':
        return 'En course';
      case 'offline':
        return 'Hors ligne';
      default:
        return 'Inconnu';
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'text-green-600';
      case 'busy':
        return 'text-orange-600';
      case 'offline':
        return 'text-gray-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Statut des Chauffeurs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drivers.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">
              Aucun chauffeur enregistré
            </p>
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="flex items-center space-x-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={driver.user.photoUrl} alt={`${driver.user.firstName} ${driver.user.lastName}`} />
                  <AvatarFallback>
                    <User className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {driver.user.firstName} {driver.user.lastName}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {driver.vehicleLicensePlate || 'Aucun véhicule assigné'}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Circle className={`w-2 h-2 ${getStatusColor(driver.status)}`} />
                  <span className={`text-xs ${getStatusTextColor(driver.status)}`}>
                    {getStatusText(driver.status)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
