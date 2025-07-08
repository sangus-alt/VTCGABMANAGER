import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Navigation, Car, Maximize2, Circle, Clock } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { formatLicensePlate } from "@/lib/constants";

interface GpsPoint {
  id: number;
  vehicleId: number;
  driverId: number;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  vehicle?: {
    licensePlate: string;
    make: string;
    model: string;
    status: string;
  };
  driver?: {
    user?: {
      firstName: string;
      lastName: string;
    };
    status: string;
  };
}

export default function GpsTracking() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("all");
  const [gpsData, setGpsData] = useState<GpsPoint[]>([]);

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const { data: initialGpsData, isLoading } = useQuery({
    queryKey: ['/api/gps-tracking'],
  });

  // WebSocket connection for real-time GPS updates
  useWebSocket({
    onMessage: (message) => {
      if (message.type === 'gps_update') {
        const newPoint = message.data as GpsPoint;
        setGpsData(prev => {
          // Update existing point or add new one
          const existingIndex = prev.findIndex(p => p.vehicleId === newPoint.vehicleId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = newPoint;
            return updated;
          }
          return [newPoint, ...prev];
        });
      }
    },
  });

  useEffect(() => {
    if (initialGpsData) {
      setGpsData(initialGpsData);
    }
  }, [initialGpsData]);

  const filteredGpsData = gpsData.filter(point => 
    selectedVehicle === "all" || point.vehicleId.toString() === selectedVehicle
  );

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

  const getVehicleStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'busy':
        return 'En course';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  };

  const formatSpeed = (speed: number) => {
    return `${Math.round(speed)} km/h`;
  };

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date();
    const update = new Date(timestamp);
    const diffMs = now.getTime() - update.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Suivi GPS Temps Réel</h1>
        <div className="flex items-center space-x-2">
          <Circle className="w-2 h-2 text-green-500 fill-current animate-pulse" />
          <span className="text-sm text-text-secondary">
            {filteredGpsData.length} véhicule{filteredGpsData.length !== 1 ? 's' : ''} en ligne
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium">Carte GPS - Gabon</CardTitle>
                <Button variant="ghost" size="icon">
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg relative overflow-hidden">
                {/* Placeholder for Google Maps integration */}
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      Carte GPS Interactive
                    </h3>
                    <p className="text-sm text-text-secondary mb-4">
                      Intégration Google Maps pour Libreville et le Gabon
                    </p>
                    <p className="text-xs text-text-secondary">
                      Les points GPS en temps réel seront affichés ici
                    </p>
                  </div>
                </div>
                
                {/* Mock GPS points for visualization */}
                {filteredGpsData.slice(0, 5).map((point, index) => (
                  <div
                    key={point.id}
                    className={`absolute w-3 h-3 rounded-full animate-pulse ${getStatusColor(point.vehicle?.status || 'offline')}`}
                    style={{
                      top: `${20 + index * 15}%`,
                      left: `${15 + index * 20}%`,
                    }}
                    title={`${point.vehicle?.licensePlate} - ${formatSpeed(point.speed || 0)}`}
                  />
                ))}
                
                <div className="absolute top-4 left-4 bg-surface rounded-lg p-3 shadow-md">
                  <div className="flex items-center space-x-2 mb-2">
                    <Circle className="w-2 h-2 text-green-500 fill-current" />
                    <span className="text-xs text-text-primary">Disponible</span>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Circle className="w-2 h-2 text-orange-500 fill-current" />
                    <span className="text-xs text-text-primary">En course</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Circle className="w-2 h-2 text-gray-400 fill-current" />
                    <span className="text-xs text-text-primary">Hors ligne</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vehicle List Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Véhicules Actifs</CardTitle>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrer par véhicule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les véhicules</SelectItem>
                  {vehicles?.map((vehicle: any) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {formatLicensePlate(vehicle.licensePlate)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 border rounded-lg">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : filteredGpsData.length === 0 ? (
                <div className="text-center py-8">
                  <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-text-secondary">
                    Aucun véhicule en ligne
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredGpsData.map((point) => (
                    <div
                      key={point.id}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <Car className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-text-primary text-sm">
                              {formatLicensePlate(point.vehicle?.licensePlate || '')}
                            </h4>
                            <Circle className={`w-2 h-2 ${getStatusColor(point.vehicle?.status || 'offline')}`} />
                          </div>
                          <p className="text-xs text-text-secondary">
                            {point.driver?.user?.firstName} {point.driver?.user?.lastName}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {point.vehicle?.make} {point.vehicle?.model}
                          </p>
                          <div className="flex items-center space-x-2 text-xs text-text-secondary">
                            <Navigation className="w-3 h-3" />
                            <span>{formatSpeed(point.speed || 0)}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-text-secondary">
                            <Clock className="w-3 h-3" />
                            <span>{formatLastUpdate(point.timestamp)}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {getVehicleStatusText(point.vehicle?.status || 'offline')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
