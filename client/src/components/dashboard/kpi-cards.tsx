import { Card, CardContent } from "@/components/ui/card";
import { Car, DollarSign, Users, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/constants";

interface KPICardsProps {
  stats: {
    todayCourses: number;
    totalRevenue: number;
    activeDrivers: number;
    totalDrivers: number;
    availableVehicles: number;
    totalVehicles: number;
  };
}

export default function KPICards({ stats }: KPICardsProps) {
  const kpiData = [
    {
      title: "Courses Aujourd'hui",
      value: stats.todayCourses,
      icon: Car,
      color: "bg-blue-100 text-blue-600",
      trend: "+12%",
      trendText: "vs hier",
    },
    {
      title: "Chiffre d'Affaires",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
      trend: "+8%",
      trendText: "vs hier",
    },
    {
      title: "Chauffeurs Actifs",
      value: `${stats.activeDrivers}/${stats.totalDrivers}`,
      icon: Users,
      color: "bg-orange-100 text-orange-600",
      trend: "75%",
      trendText: "taux d'activité",
    },
    {
      title: "Véhicules Disponibles",
      value: `${stats.availableVehicles}/${stats.totalVehicles}`,
      icon: Car,
      color: "bg-purple-100 text-purple-600",
      trend: "80%",
      trendText: "disponibilité",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpiData.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index} className="kpi-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">{item.title}</p>
                  <p className="text-2xl font-bold text-text-primary">{item.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${item.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-600 text-sm">{item.trend}</span>
                <span className="text-text-secondary text-sm ml-2">{item.trendText}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
