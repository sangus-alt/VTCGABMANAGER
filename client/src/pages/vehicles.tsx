import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit, Eye, Car } from "lucide-react";
import { VEHICLE_STATUSES, formatLicensePlate } from "@/lib/constants";

export default function Vehicles() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const filteredVehicles = vehicles?.filter((vehicle: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.licensePlate?.toLowerCase().includes(searchLower) ||
      vehicle.make?.toLowerCase().includes(searchLower) ||
      vehicle.model?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusConfig = (status: string) => {
    return VEHICLE_STATUSES.find(s => s.value === status) || VEHICLE_STATUSES[0];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Gestion des Véhicules</h1>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Véhicule
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Rechercher un véhicule..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-16 h-12 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVehicles.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Aucun véhicule trouvé
                  </h3>
                  <p className="text-text-secondary">
                    {searchTerm ? 'Aucun véhicule ne correspond à votre recherche' : 'Commencez par ajouter un véhicule'}
                  </p>
                </div>
              ) : (
                filteredVehicles.map((vehicle: any) => {
                  const statusConfig = getStatusConfig(vehicle.status);
                  
                  return (
                    <div
                      key={vehicle.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                        {vehicle.vehiclePhotoUrl ? (
                          <img 
                            src={vehicle.vehiclePhotoUrl} 
                            alt={`${vehicle.make} ${vehicle.model}`}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <Car className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-text-primary">
                            {formatLicensePlate(vehicle.licensePlate)}
                          </h3>
                          <Badge variant="secondary" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </p>
                        <p className="text-sm text-text-secondary">
                          Couleur: {vehicle.color} • Capacité: {vehicle.capacity} places
                        </p>
                        <p className="text-sm text-text-secondary">
                          Kilométrage: {vehicle.mileage?.toLocaleString() || 0} km
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
