import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PhotoUpload from "@/components/common/photo-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Car, FileText, Calendar, Fuel } from "lucide-react";
import { FUEL_TYPES } from "@/lib/constants";

const vehicleFormSchema = z.object({
  licensePlate: z.string().min(3, "Plaque d'immatriculation requise"),
  make: z.string().min(2, "Marque requise"),
  model: z.string().min(2, "Modèle requis"),
  year: z.number().min(1990, "Année invalide").max(new Date().getFullYear() + 1, "Année invalide"),
  color: z.string().min(2, "Couleur requise"),
  vin: z.string().optional(),
  insuranceNumber: z.string().min(3, "Numéro d'assurance requis"),
  insuranceExpiryDate: z.string().min(1, "Date d'expiration d'assurance requise"),
  technicalInspectionDate: z.string().min(1, "Date de contrôle technique requise"),
  mileage: z.number().min(0, "Kilométrage invalide"),
  fuelType: z.string().min(1, "Type de carburant requis"),
  capacity: z.number().min(1, "Capacité requise").max(20, "Capacité maximale 20 places"),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormProps {
  onSuccess?: () => void;
  initialData?: Partial<VehicleFormData>;
  vehicleId?: number;
}

export default function VehicleForm({ onSuccess, initialData, vehicleId }: VehicleFormProps) {
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);
  const [registrationPhoto, setRegistrationPhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      licensePlate: "",
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      vin: "",
      insuranceNumber: "",
      insuranceExpiryDate: "",
      technicalInspectionDate: "",
      mileage: 0,
      fuelType: "gasoline",
      capacity: 4,
      ...initialData,
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const formData = new FormData();
      
      // Add vehicle data
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value.toString());
      });
      
      // Add photos
      if (vehiclePhoto) {
        formData.append('vehiclePhoto', vehiclePhoto);
      }
      if (registrationPhoto) {
        formData.append('registrationPhoto', registrationPhoto);
      }

      const url = vehicleId ? `/api/vehicles/${vehicleId}` : '/api/vehicles';
      const method = vehicleId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du véhicule');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vehicles'] });
      toast({
        title: vehicleId ? "Véhicule modifié" : "Véhicule créé",
        description: vehicleId ? "Le véhicule a été modifié avec succès" : "Le nouveau véhicule a été créé avec succès",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
    createVehicleMutation.mutate(data);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>Informations du Véhicule</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plaque d'immatriculation *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="GAB-123-AB" 
                        {...field} 
                        style={{ textTransform: 'uppercase' }}
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marque *</FormLabel>
                      <FormControl>
                        <Input placeholder="Toyota" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Modèle *</FormLabel>
                      <FormControl>
                        <Input placeholder="Corolla" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Année *</FormLabel>
                      <Select 
                        value={field.value?.toString()} 
                        onValueChange={(value) => field.onChange(parseInt(value))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Couleur *</FormLabel>
                      <FormControl>
                        <Input placeholder="Blanc" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de châssis (VIN)</FormLabel>
                    <FormControl>
                      <Input placeholder="1HGBH41JXMN109186" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de carburant *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FUEL_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacité (places) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="20" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="mileage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kilométrage actuel *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0" 
                        placeholder="50000"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Documents & Insurance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5" />
                <span>Documents & Assurance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="insuranceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro d'assurance *</FormLabel>
                    <FormControl>
                      <Input placeholder="ASS-123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insuranceExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration assurance *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technicalInspectionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dernier contrôle technique *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Photo du véhicule</Label>
                  <PhotoUpload
                    onFileSelect={setVehiclePhoto}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    placeholder="Ajouter une photo du véhicule"
                  />
                </div>

                <div>
                  <Label>Photo de la carte grise</Label>
                  <PhotoUpload
                    onFileSelect={setRegistrationPhoto}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    placeholder="Ajouter la photo de la carte grise"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={createVehicleMutation.isPending}
          >
            {createVehicleMutation.isPending ? "Sauvegarde..." : (vehicleId ? "Modifier" : "Créer")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
