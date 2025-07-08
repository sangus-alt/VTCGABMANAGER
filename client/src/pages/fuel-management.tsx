import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Fuel, TrendingUp, BarChart3, Download } from "lucide-react";
import { formatCurrency, formatLicensePlate } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function FuelManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: fuelRecords, isLoading } = useQuery({
    queryKey: ['/api/fuel-records'],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const filteredRecords = fuelRecords?.filter((record: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      record.stationName?.toLowerCase().includes(searchLower) ||
      record.vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
      record.driver?.user?.firstName?.toLowerCase().includes(searchLower) ||
      record.driver?.user?.lastName?.toLowerCase().includes(searchLower)
    );
    const matchesVehicle = vehicleFilter === "all" || record.vehicleId?.toString() === vehicleFilter;
    return matchesSearch && matchesVehicle;
  }) || [];

  // Calculate fuel statistics
  const fuelStats = fuelRecords?.reduce((acc: any, record: any) => {
    acc.totalCost += record.totalCost || 0;
    acc.totalLiters += record.liters || 0;
    acc.recordCount += 1;
    return acc;
  }, { totalCost: 0, totalLiters: 0, recordCount: 0 }) || { totalCost: 0, totalLiters: 0, recordCount: 0 };

  const averagePrice = fuelStats.totalLiters > 0 ? fuelStats.totalCost / fuelStats.totalLiters : 0;

  // Group records by vehicle for consumption analysis
  const consumptionByVehicle = fuelRecords?.reduce((acc: any, record: any) => {
    const vehicleId = record.vehicleId;
    if (!acc[vehicleId]) {
      acc[vehicleId] = {
        vehicle: record.vehicle,
        totalCost: 0,
        totalLiters: 0,
        recordCount: 0,
        lastRecord: record,
      };
    }
    acc[vehicleId].totalCost += record.totalCost || 0;
    acc[vehicleId].totalLiters += record.liters || 0;
    acc[vehicleId].recordCount += 1;
    
    // Keep the most recent record
    if (new Date(record.createdAt) > new Date(acc[vehicleId].lastRecord.createdAt)) {
      acc[vehicleId].lastRecord = record;
    }
    
    return acc;
  }, {}) || {};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Gestion du Carburant</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Plein
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nouveau Plein de Carburant</DialogTitle>
              </DialogHeader>
              {/* Fuel record form would go here */}
              <div className="p-4 text-center text-text-secondary">
                Formulaire de carburant à implémenter
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="records">Enregistrements</TabsTrigger>
          <TabsTrigger value="consumption">Consommation</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Fuel Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Total Litres</p>
                    <p className="text-xl font-bold text-text-primary">
                      {fuelStats.totalLiters.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Coût Total</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(fuelStats.totalCost)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Prix Moyen/L</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(averagePrice)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Fuel className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Nb. Pleins</p>
                    <p className="text-xl font-bold text-text-primary">
                      {fuelStats.recordCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    placeholder="Rechercher un plein..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par véhicule" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les véhicules</SelectItem>
                    {vehicles?.map((vehicle: any) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {formatLicensePlate(vehicle.licensePlate)} - {vehicle.make} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary">
                    {filteredRecords.length} enregistrement{filteredRecords.length !== 1 ? 's' : ''}
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
                  {filteredRecords.length === 0 ? (
                    <div className="text-center py-12">
                      <Fuel className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">
                        Aucun enregistrement trouvé
                      </h3>
                      <p className="text-text-secondary">
                        {searchTerm ? 'Aucun plein ne correspond à votre recherche' : 'Commencez par enregistrer un plein'}
                      </p>
                    </div>
                  ) : (
                    filteredRecords.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Fuel className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-text-primary">
                              {formatLicensePlate(record.vehicle?.licensePlate || '')}
                            </h3>
                            <span className="text-sm text-text-secondary">
                              {record.vehicle?.make} {record.vehicle?.model}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-text-secondary">
                            <span>Station: {record.stationName}</span>
                            <span>Chauffeur: {record.driver?.user?.firstName} {record.driver?.user?.lastName}</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="font-medium text-text-primary">
                              {record.liters?.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L
                            </span>
                            <span className="text-text-secondary">
                              {formatCurrency(record.pricePerLiter)} / L
                            </span>
                            <span className="font-medium text-text-primary">
                              Total: {formatCurrency(record.totalCost)}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary">
                            {formatDateTime(record.createdAt)}
                            {record.mileageAtFuel && ` • Kilométrage: ${record.mileageAtFuel.toLocaleString()} km`}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consumption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par Véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(consumptionByVehicle).length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      Aucune donnée de consommation
                    </h3>
                    <p className="text-text-secondary">
                      Enregistrez des pleins pour voir les statistiques de consommation
                    </p>
                  </div>
                ) : (
                  Object.values(consumptionByVehicle).map((data: any) => (
                    <div
                      key={data.vehicle?.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <Fuel className="w-6 h-6 text-green-600" />
                      </div>
                      
                      <div className="flex-1 space-y-1">
                        <h3 className="font-medium text-text-primary">
                          {formatLicensePlate(data.vehicle?.licensePlate || '')}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          {data.vehicle?.make} {data.vehicle?.model}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Total: {data.totalLiters.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} L</span>
                          <span>Coût: {formatCurrency(data.totalCost)}</span>
                          <span>{data.recordCount} plein{data.recordCount !== 1 ? 's' : ''}</span>
                        </div>
                        <p className="text-xs text-text-secondary">
                          Dernier plein: {formatDate(data.lastRecord.createdAt)}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-bold text-text-primary">
                          {(data.totalCost / data.recordCount).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} FCFA
                        </p>
                        <p className="text-xs text-text-secondary">Coût moyen/plein</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Carburant</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Rapports détaillés à venir
                </h3>
                <p className="text-text-secondary">
                  Les rapports de consommation et d'analyse seront disponibles prochainement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
