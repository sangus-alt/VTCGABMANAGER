import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Car, 
  Users, 
  Route, 
  MapPin, 
  Calendar, 
  CreditCard, 
  Fuel, 
  Wrench, 
  BarChart3, 
  Settings,
  CarTaxiFront
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  { name: "Tableau de bord", href: "/", icon: BarChart3 },
  { name: "Chauffeurs", href: "/drivers", icon: Users },
  { name: "Véhicules", href: "/vehicles", icon: Car },
  { name: "Courses", href: "/bookings", icon: Route },
  { name: "GPS Temps Réel", href: "/gps-tracking", icon: MapPin },
  { name: "Réservations", href: "/bookings", icon: Calendar },
  { name: "Paiements", href: "/payments", icon: CreditCard },
  { name: "Carburant", href: "/fuel-management", icon: Fuel },
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Statistiques", href: "/statistics", icon: BarChart3 },
  { name: "Configuration", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <nav className={cn(
      "bg-surface shadow-lg flex flex-col transition-all duration-300",
      isOpen ? "w-64" : "w-16"
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <CarTaxiFront className="w-6 h-6 text-primary-foreground" />
          </div>
          {isOpen && (
            <div>
              <h1 className="text-lg font-medium text-text-primary">VTC GAB</h1>
              <p className="text-xs text-text-secondary">Gestion Taxi</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "nav-item",
                    isActive && "active",
                    !isOpen && "justify-center"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      
      {isOpen && (
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-text-primary">Admin Système</p>
              <p className="text-xs text-text-secondary">Administrateur</p>
            </div>
            <button className="text-text-secondary hover:text-text-primary">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
