import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Download, Calendar, DollarSign, Users, Car } from "lucide-react";
import { formatCurrency } from "@/lib/constants";
import { useState } from "react";

export default function Statistics() {
  const [timeRange, setTimeRange] = useState("30d");

  const { data: dashboardStats } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ['/api/dashboard/payment-summary'],
  });

  const { data: bookings } = useQuery({
    queryKey: ['/api/bookings'],
  });

  const { data: drivers } = useQuery({
    queryKey: ['/api/drivers'],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Calculate additional statistics
  const completedBookings = bookings?.filter((booking: any) => booking.status === 'completed').length || 0;
  const activeDriversCount = drivers?.filter((driver: any) => driver.status === 'available').length || 0;
  const availableVehiclesCount = vehicles?.filter((vehicle: any) => vehicle.status === 'available').length || 0;

  const performanceData = [
    {
      title: "Taux de Réussite",
      value: bookings ? `${Math.round((completedBookings / bookings.length) * 100)}%` : "0%",
      description: "Courses terminées avec succès",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Taux d'Activité Chauffeurs",
      value: drivers ? `${Math.round((activeDriversCount / drivers.length) * 100)}%` : "0%",
      description: "Chauffeurs actuellement actifs",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Disponibilité Véhicules",
      value: vehicles ? `${Math.round((availableVehiclesCount / vehicles.length) * 100)}%` : "0%",
      description: "Véhicules disponibles pour courses",
      icon: Car,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Revenu Moyen/Course",
      value: completedBookings > 0 && paymentSummary ? formatCurrency(paymentSummary.total / completedBookings) : formatCurrency(0),
      description: "Montant moyen par course",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Statistiques & Rapports</h1>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
              <SelectItem value="1y">1 an</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="financial">Financier</TabsTrigger>
          <TabsTrigger value="operational">Opérationnel</TabsTrigger>
          <TabsTrigger value="drivers">Chauffeurs</TabsTrigger>
          <TabsTrigger value="vehicles">Véhicules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {performanceData.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${metric.bgColor}`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary">{metric.title}</p>
                        <p className="text-xl font-bold text-text-primary">{metric.value}</p>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary mt-2">{metric.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary">Graphique à venir</p>
                    <p className="text-xs text-text-secondary">Intégration Chart.js prévue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-text-secondary">Graphique à venir</p>
                    <p className="text-xs text-text-secondary">Répartition par statut</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenus Totaux</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">
                    {formatCurrency(paymentSummary?.total || 0)}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">Période sélectionnée</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Courses Payées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">{completedBookings}</p>
                  <p className="text-sm text-text-secondary mt-1">Transactions réussies</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenu Moyen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-text-primary">
                    {completedBookings > 0 && paymentSummary ? 
                      formatCurrency(paymentSummary.total / completedBookings) : 
                      formatCurrency(0)
                    }
                  </p>
                  <p className="text-sm text-text-secondary mt-1">Par course</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Évolution Financière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Graphique des revenus à venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Total Courses</h3>
                <p className="text-3xl font-bold text-blue-600">{bookings?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Courses Terminées</h3>
                <p className="text-3xl font-bold text-green-600">{completedBookings}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Courses Annulées</h3>
                <p className="text-3xl font-bold text-red-600">
                  {bookings?.filter((booking: any) => booking.status === 'cancelled').length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">En Cours</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {bookings?.filter((booking: any) => booking.status === 'in_progress').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Opérationnelle</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Statistiques opérationnelles à venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="drivers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Total Chauffeurs</h3>
                <p className="text-3xl font-bold text-blue-600">{drivers?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Chauffeurs Actifs</h3>
                <p className="text-3xl font-bold text-green-600">{activeDriversCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Hors Ligne</h3>
                <p className="text-3xl font-bold text-gray-600">
                  {drivers?.filter((driver: any) => driver.status === 'offline').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance des Chauffeurs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Statistiques des chauffeurs à venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Total Véhicules</h3>
                <p className="text-3xl font-bold text-blue-600">{vehicles?.length || 0}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Disponibles</h3>
                <p className="text-3xl font-bold text-green-600">{availableVehiclesCount}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">En Course</h3>
                <p className="text-3xl font-bold text-orange-600">
                  {vehicles?.filter((vehicle: any) => vehicle.status === 'busy').length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-medium text-text-primary mb-2">Maintenance</h3>
                <p className="text-3xl font-bold text-red-600">
                  {vehicles?.filter((vehicle: any) => vehicle.status === 'maintenance').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Utilisation des Véhicules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-text-secondary">Statistiques des véhicules à venir</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
