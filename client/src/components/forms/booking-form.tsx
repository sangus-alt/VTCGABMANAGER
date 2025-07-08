import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, User, Car, CreditCard, Calendar, Clock } from "lucide-react";
import { PAYMENT_METHODS, formatCurrency } from "@/lib/constants";

const bookingFormSchema = z.object({
  clientId: z.number().min(1, "Client requis"),
  driverId: z.number().optional(),
  vehicleId: z.number().optional(),
  pickupLocation: z.string().min(5, "Lieu de départ requis"),
  dropoffLocation: z.string().min(5, "Destination requise"),
  scheduledTime: z.string().optional(),
  baseFare: z.number().min(0, "Tarif de base requis"),
  totalFare: z.number().min(0, "Tarif total requis"),
  paymentMethod: z.string().min(1, "Méthode de paiement requise"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSuccess?: () => void;
  initialData?: Partial<BookingFormData>;
  bookingId?: number;
}

export default function BookingForm({ onSuccess, initialData, bookingId }: BookingFormProps) {
  const [estimatedDistance, setEstimatedDistance] = useState<number>(0);
  const [estimatedDuration, setEstimatedDuration] = useState<number>(0);
  const { toast } = useToast();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      clientId: 0,
      driverId: undefined,
      vehicleId: undefined,
      pickupLocation: "",
      dropoffLocation: "",
      scheduledTime: "",
      baseFare: 1000, // Base fare in FCFA
      totalFare: 1000,
      paymentMethod: "cash",
      notes: "",
      ...initialData,
    },
  });

  // Fetch available data
  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  const { data: drivers } = useQuery({
    queryKey: ['/api/drivers'],
  });

  const { data: vehicles } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  const availableDrivers = drivers?.filter((driver: any) => driver.status === 'available') || [];
  const availableVehicles = vehicles?.filter((vehicle: any) => vehicle.status === 'available') || [];

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const bookingData = {
        ...data,
        distance: estimatedDistance,
        duration: estimatedDuration,
        status: 'pending',
        paymentStatus: 'pending',
        currency: 'FCFA',
      };

      const url = bookingId ? `/api/bookings/${bookingId}` : '/api/bookings';
      const method = bookingId ? 'PUT' : 'POST';
      
      return await apiRequest(method, url, bookingData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: bookingId ? "Réservation modifiée" : "Réservation créée",
        description: bookingId ? "La réservation a été modifiée avec succès" : "La nouvelle réservation a été créée avec succès",
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

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate(data);
  };

  // Calculate fare based on distance and duration
  const calculateFare = () => {
    const baseFare = 1000; // Base fare in FCFA
    const pricePerKm = 300; // FCFA per km
    const pricePerMinute = 50; // FCFA per minute
    
    const distanceFare = estimatedDistance * pricePerKm;
    const timeFare = estimatedDuration * pricePerMinute;
    const totalFare = baseFare + distanceFare + timeFare;
    
    form.setValue('baseFare', baseFare);
    form.setValue('totalFare', Math.round(totalFare));
  };

  // Mock function to estimate route (in real implementation, use Google Maps API)
  const estimateRoute = () => {
    const pickup = form.getValues('pickupLocation');
    const dropoff = form.getValues('dropoffLocation');
    
    if (pickup && dropoff) {
      // Mock calculation - in real app, use Google Maps Distance Matrix API
      const mockDistance = Math.random() * 20 + 5; // 5-25 km
      const mockDuration = mockDistance * 3 + Math.random() * 15; // Estimate with traffic
      
      setEstimatedDistance(Number(mockDistance.toFixed(1)));
      setEstimatedDuration(Math.round(mockDuration));
      
      // Auto-calculate fare
      setTimeout(calculateFare, 100);
      
      toast({
        title: "Itinéraire estimé",
        description: `Distance: ${mockDistance.toFixed(1)} km, Durée: ${Math.round(mockDuration)} min`,
      });
    }
  };

  const watchPickup = form.watch('pickupLocation');
  const watchDropoff = form.watch('dropoffLocation');

  // Auto-estimate when both locations are filled
  useState(() => {
    if (watchPickup && watchDropoff && watchPickup.length > 5 && watchDropoff.length > 5) {
      estimateRoute();
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>Détails de la Course</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client *</FormLabel>
                    <Select 
                      value={field.value?.toString()} 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clients?.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.user?.firstName} {client.user?.lastName}
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
                name="pickupLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lieu de départ *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Aéroport Léon Mba, Libreville" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dropoffLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Centre-ville, Libreville" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={estimateRoute}
                  className="w-full"
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Estimer l'itinéraire
                </Button>
              </div>

              {estimatedDistance > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Estimation:</strong> {estimatedDistance} km, {estimatedDuration} min
                  </p>
                </div>
              )}

              <FormField
                control={form.control}
                name="scheduledTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Heure programmée (optionnel)</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (optionnel)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Instructions spéciales..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Assignment & Payment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Car className="w-5 h-5" />
                <span>Affectation & Paiement</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="driverId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chauffeur (optionnel)</FormLabel>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Affectation automatique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Affectation automatique</SelectItem>
                        {availableDrivers.map((driver: any) => (
                          <SelectItem key={driver.id} value={driver.id.toString()}>
                            {driver.user?.firstName} {driver.user?.lastName}
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
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Véhicule (optionnel)</FormLabel>
                    <Select 
                      value={field.value?.toString() || ""} 
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Affectation automatique" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Affectation automatique</SelectItem>
                        {availableVehicles.map((vehicle: any) => (
                          <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                            {vehicle.licensePlate} - {vehicle.make} {vehicle.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="baseFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif de base (FCFA) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="totalFare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tarif total (FCFA) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0" 
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
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Méthode de paiement *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-green-800">Total à payer:</span>
                  <span className="text-lg font-bold text-green-800">
                    {formatCurrency(form.watch('totalFare') || 0)}
                  </span>
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
            disabled={createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? "Création..." : (bookingId ? "Modifier" : "Créer la réservation")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
