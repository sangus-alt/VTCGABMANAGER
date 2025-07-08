import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Download, CreditCard, Smartphone, Banknote, TrendingUp } from "lucide-react";
import { formatCurrency, PAYMENT_METHODS } from "@/lib/constants";

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");

  const { data: payments, isLoading } = useQuery({
    queryKey: ['/api/payments'],
  });

  const { data: paymentSummary } = useQuery({
    queryKey: ['/api/dashboard/payment-summary'],
  });

  const filteredPayments = payments?.filter((payment: any) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      payment.transactionId?.toLowerCase().includes(searchLower) ||
      payment.amount?.toString().includes(searchLower) ||
      payment.booking?.id?.toString().includes(searchLower)
    );
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    const matchesMethod = methodFilter === "all" || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  }) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Terminé';
      case 'pending':
        return 'En attente';
      case 'failed':
        return 'Échoué';
      case 'refunded':
        return 'Remboursé';
      default:
        return 'Inconnu';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return Banknote;
      case 'mobile_money':
        return Smartphone;
      case 'card':
        return CreditCard;
      default:
        return CreditCard;
    }
  };

  const getMethodText = (method: string) => {
    const methodConfig = PAYMENT_METHODS.find(m => m.value === method);
    return methodConfig?.label || method;
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
        <h1 className="text-2xl font-bold text-text-primary">Gestion des Paiements</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Banknote className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Espèces</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(paymentSummary?.cash || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Mobile Money</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(paymentSummary?.mobile || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Cartes</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(paymentSummary?.card || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Total Aujourd'hui</p>
                    <p className="text-xl font-bold text-text-primary">
                      {formatCurrency(paymentSummary?.total || 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input
                    placeholder="Rechercher une transaction..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="failed">Échoué</SelectItem>
                    <SelectItem value="refunded">Remboursé</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrer par méthode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les méthodes</SelectItem>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-text-secondary">
                    {filteredPayments.length} transaction{filteredPayments.length !== 1 ? 's' : ''}
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
                  {filteredPayments.length === 0 ? (
                    <div className="text-center py-12">
                      <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-text-primary mb-2">
                        Aucune transaction trouvée
                      </h3>
                      <p className="text-text-secondary">
                        {searchTerm ? 'Aucune transaction ne correspond à votre recherche' : 'Aucune transaction enregistrée'}
                      </p>
                    </div>
                  ) : (
                    filteredPayments.map((payment: any) => {
                      const MethodIcon = getMethodIcon(payment.paymentMethod);
                      
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <MethodIcon className="w-6 h-6 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-text-primary">
                                {formatCurrency(payment.amount)}
                              </h3>
                              <Badge variant="secondary" className={getStatusColor(payment.status)}>
                                {getStatusText(payment.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-text-secondary">
                              Réservation #{payment.bookingId} • {getMethodText(payment.paymentMethod)}
                            </p>
                            {payment.transactionId && (
                              <p className="text-xs text-text-secondary">
                                Transaction: {payment.transactionId}
                              </p>
                            )}
                            <p className="text-xs text-text-secondary">
                              {formatDateTime(payment.createdAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm">
                              Détails
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
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rapports de Paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">
                  Rapports à venir
                </h3>
                <p className="text-text-secondary">
                  Les rapports détaillés seront disponibles prochainement
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
