import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, MapPin, CreditCard, Bell, Shield, Globe } from "lucide-react";
import { CEMAC_COUNTRIES, FUEL_TYPES } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();

  const { data: systemSettings, isLoading } = useQuery({
    queryKey: ['/api/system-settings'],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const response = await fetch(`/api/system-settings/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!response.ok) throw new Error('Failed to update setting');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/system-settings'] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les modifications ont été sauvegardées",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive",
      });
    },
  });

  const getSetting = (key: string, defaultValue: string = "") => {
    const setting = systemSettings?.find((s: any) => s.key === key);
    return setting?.value || defaultValue;
  };

  const handleSaveSetting = (key: string, value: string) => {
    updateSettingMutation.mutate({ key, value });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Configuration Système</h1>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-text-secondary" />
          <span className="text-sm text-text-secondary">VTC GAB - Administration</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="location">Localisation</TabsTrigger>
          <TabsTrigger value="payment">Paiements</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Paramètres Généraux</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Nom de l'entreprise</Label>
                  <Input
                    id="company_name"
                    defaultValue={getSetting("company_name", "VTC GAB")}
                    onBlur={(e) => handleSaveSetting("company_name", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Téléphone</Label>
                  <Input
                    id="company_phone"
                    defaultValue={getSetting("company_phone", "+241 XX XX XX XX")}
                    onBlur={(e) => handleSaveSetting("company_phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company_email">Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    defaultValue={getSetting("company_email", "contact@vtcgab.com")}
                    onBlur={(e) => handleSaveSetting("company_email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_currency">Devise par défaut</Label>
                  <Select 
                    defaultValue={getSetting("default_currency", "FCFA")}
                    onValueChange={(value) => handleSaveSetting("default_currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FCFA">Franc CFA (FCFA)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="USD">Dollar US (USD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="company_address">Adresse</Label>
                <Textarea
                  id="company_address"
                  defaultValue={getSetting("company_address", "Libreville, Gabon")}
                  onBlur={(e) => handleSaveSetting("company_address", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tarification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="base_fare">Tarif de base (FCFA)</Label>
                  <Input
                    id="base_fare"
                    type="number"
                    defaultValue={getSetting("base_fare", "1000")}
                    onBlur={(e) => handleSaveSetting("base_fare", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_km">Prix par km (FCFA)</Label>
                  <Input
                    id="price_per_km"
                    type="number"
                    defaultValue={getSetting("price_per_km", "300")}
                    onBlur={(e) => handleSaveSetting("price_per_km", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price_per_minute">Prix par minute (FCFA)</Label>
                  <Input
                    id="price_per_minute"
                    type="number"
                    defaultValue={getSetting("price_per_minute", "50")}
                    onBlur={(e) => handleSaveSetting("price_per_minute", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Configuration CEMAC</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primary_country">Pays principal</Label>
                  <Select 
                    defaultValue={getSetting("primary_country", "GAB")}
                    onValueChange={(value) => handleSaveSetting("primary_country", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CEMAC_COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="license_plate_format">Format plaque d'immatriculation</Label>
                  <Input
                    id="license_plate_format"
                    defaultValue={getSetting("license_plate_format", "GAB-XXX-XX")}
                    onBlur={(e) => handleSaveSetting("license_plate_format", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_city">Ville principale</Label>
                  <Input
                    id="primary_city"
                    defaultValue={getSetting("primary_city", "Libreville")}
                    onBlur={(e) => handleSaveSetting("primary_city", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select 
                    defaultValue={getSetting("timezone", "Africa/Libreville")}
                    onValueChange={(value) => handleSaveSetting("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Libreville">Libreville (WAT)</SelectItem>
                      <SelectItem value="Africa/Douala">Douala (WAT)</SelectItem>
                      <SelectItem value="Africa/Bangui">Bangui (WAT)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration GPS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="map_provider">Fournisseur de cartes</Label>
                  <Select 
                    defaultValue={getSetting("map_provider", "google")}
                    onValueChange={(value) => handleSaveSetting("map_provider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Google Maps</SelectItem>
                      <SelectItem value="mapbox">Mapbox</SelectItem>
                      <SelectItem value="openstreetmap">OpenStreetMap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gps_update_interval">Intervalle GPS (secondes)</Label>
                  <Input
                    id="gps_update_interval"
                    type="number"
                    defaultValue={getSetting("gps_update_interval", "30")}
                    onBlur={(e) => handleSaveSetting("gps_update_interval", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Méthodes de Paiement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Paiement en espèces</h4>
                    <p className="text-sm text-text-secondary">Accepter les paiements en liquide</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Mobile Money</h4>
                    <p className="text-sm text-text-secondary">Moov Money, Airtel Money</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Cartes bancaires</h4>
                    <p className="text-sm text-text-secondary">Visa, Mastercard</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Virement bancaire</h4>
                    <p className="text-sm text-text-secondary">Paiement par virement</p>
                  </div>
                  <Switch />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <Label htmlFor="mobile_money_commission">Commission Mobile Money (%)</Label>
                  <Input
                    id="mobile_money_commission"
                    type="number"
                    step="0.1"
                    defaultValue={getSetting("mobile_money_commission", "2.5")}
                    onBlur={(e) => handleSaveSetting("mobile_money_commission", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="card_commission">Commission Carte (%)</Label>
                  <Input
                    id="card_commission"
                    type="number"
                    step="0.1"
                    defaultValue={getSetting("card_commission", "3.0")}
                    onBlur={(e) => handleSaveSetting("card_commission", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Nouvelles réservations</h4>
                    <p className="text-sm text-text-secondary">Notifier les nouvelles demandes</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Alertes maintenance</h4>
                    <p className="text-sm text-text-secondary">Rappels de maintenance véhicules</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Statut chauffeurs</h4>
                    <p className="text-sm text-text-secondary">Changements de statut</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Paiements</h4>
                    <p className="text-sm text-text-secondary">Confirmation des paiements</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <Label htmlFor="notification_email">Email de notification</Label>
                  <Input
                    id="notification_email"
                    type="email"
                    defaultValue={getSetting("notification_email", "admin@vtcgab.com")}
                    onBlur={(e) => handleSaveSetting("notification_email", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sms_provider">Fournisseur SMS</Label>
                  <Select 
                    defaultValue={getSetting("sms_provider", "local")}
                    onValueChange={(value) => handleSaveSetting("sms_provider", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Opérateur local</SelectItem>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Sécurité</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Authentification à deux facteurs</h4>
                    <p className="text-sm text-text-secondary">Sécurité renforcée pour les admins</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Journalisation des actions</h4>
                    <p className="text-sm text-text-secondary">Enregistrer toutes les actions</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Sauvegarde automatique</h4>
                    <p className="text-sm text-text-secondary">Backup quotidien des données</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
                <div className="space-y-2">
                  <Label htmlFor="session_timeout">Expiration session (minutes)</Label>
                  <Input
                    id="session_timeout"
                    type="number"
                    defaultValue={getSetting("session_timeout", "120")}
                    onBlur={(e) => handleSaveSetting("session_timeout", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backup_frequency">Fréquence sauvegarde</Label>
                  <Select 
                    defaultValue={getSetting("backup_frequency", "daily")}
                    onValueChange={(value) => handleSaveSetting("backup_frequency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Toutes les heures</SelectItem>
                      <SelectItem value="daily">Quotidienne</SelectItem>
                      <SelectItem value="weekly">Hebdomadaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-primary">Sauvegarder les modifications</h3>
              <p className="text-sm text-text-secondary">
                Les paramètres sont sauvegardés automatiquement lors des modifications
              </p>
            </div>
            <Button 
              className="btn-primary"
              disabled={updateSettingMutation.isPending}
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettingMutation.isPending ? "Sauvegarde..." : "Tout sauvegarder"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
