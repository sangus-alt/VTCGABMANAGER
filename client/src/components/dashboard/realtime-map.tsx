import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Maximize2, Circle } from "lucide-react";

interface RealtimeMapProps {
  activeVehicles: number;
}

export default function RealtimeMap({ activeVehicles }: RealtimeMapProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Suivi GPS Temps Réel</CardTitle>
          <Button variant="ghost" size="icon">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-gray-100 rounded-lg relative overflow-hidden">
          {/* Placeholder for map - in real implementation, integrate with Google Maps */}
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <p className="text-sm text-text-secondary">Carte GPS - Libreville</p>
              <p className="text-xs text-text-secondary">Intégration Google Maps à venir</p>
            </div>
          </div>
          <div className="absolute top-2 left-2 bg-surface rounded-lg p-2 shadow-md">
            <div className="flex items-center space-x-2">
              <Circle className="w-2 h-2 text-green-500 fill-current" />
              <span className="text-xs text-text-primary">{activeVehicles} taxis en ligne</span>
            </div>
          </div>
          {/* Mock GPS points */}
          <div className="absolute top-16 left-12 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-16 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-24 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}
