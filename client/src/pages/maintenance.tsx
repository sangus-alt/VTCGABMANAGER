import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, AlertTriangle, Wrench, Car, Calendar, FileText } from "lucide-react";
import { MAINTENANCE_TYPES, formatCurrency, formatLicensePlate } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Maintenance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: maintenanceRecords, isLoading } = useQuery({
    queryKey: ['/api/maintenance-records'],
  });

  const { data: alerts } = useQuery({
    queryKey: ['/api/maintenance-records/alerts'],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const filteredRecords = maintenanceRecords?.filter((record: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      record.description?.toLowerCase().includes(searchLower) ||
      record.vehicle?.licensePlate?.toLowerCase().includes(searchLower) ||
      record.serviceProvider?.toLowerCase().includes(searchLower)
    );
    const matchesType = typeFilter === "all" || record.type === typeFilter;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'in_progress':
        return 'En cours';
      case 'scheduled':
        return 'Planifié';
      default:
        return 'Inconnu';
    }
  };

  const getTypeText = (type: string) => {
    const typeConfig = MAINTENANCE_TYPES.find(t => t.value === type);
    return typeConfig?.label || type;
  };

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

  const getAlertPriority = (record: any) => {
    const today = new Date();
    const nextServiceDate = new Date(record.nextServiceDate || record.createdAt);
    const diffDays = Math.ceil((nextServiceDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    
    if (diffDays < 0) return 'high';
    if (diffDays <= 7) return 'high';
    if (diffDays <= 30) return 'medium';
    return 'low';
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Gestion de la Maintenance</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nouveau Service de Maintenance</DialogTitle>
            </DialogHeader>
            {/* Maintenance form would go here */}
            <div className="p-4 text-center text-text-secondary">
              Formulaire de maintenance à implémenter
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="alerts">Alertes</TabsTrigger>
          <TabsTrigger value="records">Historique</TabsTrigger>
          <TabsTrigger value="schedule">Planification</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span>Alertes de Maintenance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {alerts?.length === 0 ? (
                <div className="text-center py-12">
                  <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    Aucune alerte de maintenance
                  </h3>
                  <p className="text-text-secondary">
                    Tous les véhicules sont à jour avec leur maintenance
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts?.map((alert: any) => {
                    const Icon = getAlertIcon(alert.type);
                    const priority = getAlertPriority(alert);
                    
                    return (
                      <div
                        key={alert.id}
                        className={`flex items-start space-x-3 p-4 rounded-lg border ${getAlertColor(priority)}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          priority === 'high' ? 'bg-red-500' : 
                          priority === 'medium' ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-text-primary">
                              {getTypeText(alert.type)}
                            </h4>
                            <Badge variant="secondary" className={
                              priority === 'high' ? 'bg-red-100 text-red-800' :
                              priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {priority === 'high' ? 'Urgent' :
                               priority === 'medium' ? 'Important' : 'Normal'}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary mb-1">
                            {formatLicensePlate(alert.vehicle?.licensePlate || '')} - {alert.vehicle?.make} {alert.vehicle?.model}
                          </p>
                          <p className="text-sm text-text-primary">{alert.description}</p>
                          {alert.nextServiceDate && (
                            <p className="text-xs text-text-secondary mt-1">
                              Échéance: {formatDate(alert.nextServiceDate)}
                            </p>
                          )}
                        </div>
                        <Button size="sm" variant="outline">
                          Planifier
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    placeholder="Rechercher un service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les types</SelectItem>
                    {MAINTENANCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="scheduled">Planifié</SelectItem>
                  </SelectContent>
                </Select>
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
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">
                        Aucun enregistrement trouvé
                      </h3>
                      <p className="text-text-secondary">
                        {searchTerm ? 'Aucun service ne correspond à votre recherche' : 'Aucun service enregistré'}
                      </p>
                    </div>
                  ) : (
                    filteredRecords.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Wrench className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-text-primary">
                              {getTypeText(record.type)}
                            </h3>
                            <Badge variant="secondary" className={getStatusColor(record.status)}>
                              {getStatusText(record.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">
                            {formatLicensePlate(record.vehicle?.licensePlate || '')} - {record.vehicle?.make} {record.vehicle?.model}
                          </p>
                          <p className="text-sm text-text-primary">{record.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-text-secondary">
                            <span>Prestataire: {record.serviceProvider || 'Non défini'}</span>
                            <span>Date: {formatDate(record.createdAt)}</span>
                            {record.cost && (
                              <span>Coût: {formatCurrency(record.cost)}</span>
                            )}
                          </div>
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

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Planification des Maintenances</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Calendrier de maintenance
                </h3>
                <p className="text-text-secondary">
                  Le système de planification sera disponible prochainement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
