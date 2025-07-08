import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Plus, Edit, Eye, User } from "lucide-react";
import { DRIVER_STATUSES, formatLicensePlate } from "@/lib/constants";

export default function Drivers() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['/api/drivers'],
  });

  const filteredDrivers = drivers?.filter((driver: any) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      driver.user?.firstName?.toLowerCase().includes(searchLower) ||
      driver.user?.lastName?.toLowerCase().includes(searchLower) ||
      driver.licenseNumber?.toLowerCase().includes(searchLower)
    );
  }) || [];

  const getStatusConfig = (status: string) => {
    return DRIVER_STATUSES.find(s => s.value === status) || DRIVER_STATUSES[0];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Gestion des Chauffeurs</h1>
        <Button className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Chauffeur
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <Input
                placeholder="Rechercher un chauffeur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-text-secondary">
                {filteredDrivers.length} chauffeur{filteredDrivers.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDrivers.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Aucun chauffeur trouvé
                  </h3>
                  <p className="text-text-secondary">
                    {searchTerm ? 'Aucun chauffeur ne correspond à votre recherche' : 'Commencez par ajouter un chauffeur'}
                  </p>
                </div>
              ) : (
                filteredDrivers.map((driver: any) => {
                  const statusConfig = getStatusConfig(driver.status);
                  
                  return (
                    <div
                      key={driver.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={driver.profilePhotoUrl} alt={`${driver.user?.firstName} ${driver.user?.lastName}`} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-text-primary">
                            {driver.user?.firstName} {driver.user?.lastName}
                          </h3>
                          <Badge variant="secondary" className={statusConfig.color}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-text-secondary">
                          Permis: {formatLicensePlate(driver.licenseNumber)}
                        </p>
                        <p className="text-sm text-text-secondary">
                          Téléphone: {driver.user?.phone || 'Non renseigné'}
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
