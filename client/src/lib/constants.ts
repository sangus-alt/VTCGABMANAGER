export const PAYMENT_METHODS = [
  { value: 'cash', label: 'Espèces' },
  { value: 'mobile_money', label: 'Mobile Money' },
  { value: 'card', label: 'Carte Bancaire' },
  { value: 'bank_transfer', label: 'Virement Bancaire' },
];

export const DRIVER_STATUSES = [
  { value: 'available', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'busy', label: 'En course', color: 'bg-orange-100 text-orange-800' },
  { value: 'offline', label: 'Hors ligne', color: 'bg-gray-100 text-gray-800' },
  { value: 'suspended', label: 'Suspendu', color: 'bg-red-100 text-red-800' },
];

export const VEHICLE_STATUSES = [
  { value: 'available', label: 'Disponible', color: 'bg-green-100 text-green-800' },
  { value: 'busy', label: 'En course', color: 'bg-orange-100 text-orange-800' },
  { value: 'maintenance', label: 'En maintenance', color: 'bg-red-100 text-red-800' },
  { value: 'inactive', label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
];

export const BOOKING_STATUSES = [
  { value: 'pending', label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'En cours', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Terminé', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Annulé', color: 'bg-red-100 text-red-800' },
];

export const FUEL_TYPES = [
  { value: 'gasoline', label: 'Essence' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'hybrid', label: 'Hybride' },
  { value: 'electric', label: 'Électrique' },
];

export const MAINTENANCE_TYPES = [
  { value: 'oil_change', label: 'Vidange' },
  { value: 'tire_change', label: 'Changement de pneus' },
  { value: 'brake_service', label: 'Service des freins' },
  { value: 'general_service', label: 'Service général' },
];

export const CEMAC_COUNTRIES = [
  { value: 'GAB', label: 'Gabon' },
  { value: 'CMR', label: 'Cameroun' },
  { value: 'CAF', label: 'République Centrafricaine' },
  { value: 'COG', label: 'République du Congo' },
  { value: 'GNQ', label: 'Guinée Équatoriale' },
  { value: 'TCD', label: 'Tchad' },
];

export const CURRENCY = 'FCFA';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + CURRENCY;
};

export const formatLicensePlate = (plate: string) => {
  // Format for CEMAC license plates (e.g., GAB-123-AB)
  return plate.toUpperCase();
};
