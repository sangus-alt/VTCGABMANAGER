import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import PhotoUpload from "@/components/common/photo-upload";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Copyright, Phone, MapPin, Calendar } from "lucide-react";

const driverFormSchema = z.object({
  // User information
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  username: z.string().min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  
  // Driver specific information
  licenseNumber: z.string().min(5, "Numéro de permis requis"),
  licenseExpiryDate: z.string().min(1, "Date d'expiration requise"),
  dateOfBirth: z.string().min(1, "Date de naissance requise"),
  address: z.string().min(10, "Adresse complète requise"),
  emergencyContactName: z.string().min(2, "Nom du contact d'urgence requis"),
  emergencyContactPhone: z.string().min(8, "Téléphone du contact d'urgence requis"),
});

type DriverFormData = z.infer<typeof driverFormSchema>;

interface DriverFormProps {
  onSuccess?: () => void;
  initialData?: Partial<DriverFormData>;
  driverId?: number;
}

export default function DriverForm({ onSuccess, initialData, driverId }: DriverFormProps) {
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      username: "",
      password: "",
      licenseNumber: "",
      licenseExpiryDate: "",
      dateOfBirth: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      ...initialData,
    },
  });

  const createDriverMutation = useMutation({
    mutationFn: async (data: DriverFormData) => {
      const formData = new FormData();
      
      // Add user data
      formData.append('firstName', data.firstName);
      formData.append('lastName', data.lastName);
      formData.append('email', data.email);
      formData.append('phone', data.phone);
      formData.append('username', data.username);
      formData.append('password', data.password);
      formData.append('role', 'driver');
      
      // Add driver data
      formData.append('licenseNumber', data.licenseNumber);
      formData.append('licenseExpiryDate', data.licenseExpiryDate);
      formData.append('dateOfBirth', data.dateOfBirth);
      formData.append('address', data.address);
      formData.append('emergencyContactName', data.emergencyContactName);
      formData.append('emergencyContactPhone', data.emergencyContactPhone);
      
      // Add photos
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }
      if (licensePhoto) {
        formData.append('licensePhoto', licensePhoto);
      }

      const url = driverId ? `/api/drivers/${driverId}` : '/api/drivers';
      const method = driverId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde du chauffeur');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drivers'] });
      toast({
        title: driverId ? "Chauffeur modifié" : "Chauffeur créé",
        description: driverId ? "Le chauffeur a été modifié avec succès" : "Le nouveau chauffeur a été créé avec succès",
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

  const onSubmit = (data: DriverFormData) => {
    createDriverMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Informations Personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Jean" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Obame" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="jean.obame@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone *</FormLabel>
                    <FormControl>
                      <Input placeholder="+241 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresse *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Adresse complète à Libreville, Gabon" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Copyright className="w-5 h-5" />
                <span>Informations Professionnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur *</FormLabel>
                      <FormControl>
                        <Input placeholder="jean.obame" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="******" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="licenseNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéro de permis *</FormLabel>
                    <FormControl>
                      <Input placeholder="GAB-XXXXX-XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="licenseExpiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration du permis *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <div>
                  <Label>Photo de profil</Label>
                  <PhotoUpload
                    onFileSelect={setProfilePhoto}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    placeholder="Ajouter une photo de profil"
                  />
                </div>

                <div>
                  <Label>Photo du permis de conduire</Label>
                  <PhotoUpload
                    onFileSelect={setLicensePhoto}
                    accept="image/*"
                    maxSize={2 * 1024 * 1024} // 2MB
                    placeholder="Ajouter la photo du permis"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Contact d'Urgence</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom du contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="Marie Obame" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergencyContactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone du contact *</FormLabel>
                    <FormControl>
                      <Input placeholder="+241 XX XX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSuccess}>
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="btn-primary"
            disabled={createDriverMutation.isPending}
          >
            {createDriverMutation.isPending ? "Sauvegarde..." : (driverId ? "Modifier" : "Créer")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
