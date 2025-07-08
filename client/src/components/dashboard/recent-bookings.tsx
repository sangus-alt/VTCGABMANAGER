import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/constants";
import { User } from "lucide-react";

interface Booking {
  id: number;
  clientName: string;
  pickupLocation: string;
  dropoffLocation: string;
  totalFare: number;
  createdAt: string;
}

interface RecentBookingsProps {
  bookings: Booking[];
}

export default function RecentBookings({ bookings }: RecentBookingsProps) {
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `Il y a ${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays}j`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Réservations Récentes</CardTitle>
          <Button variant="ghost" size="sm">
            Voir tout
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {bookings.length === 0 ? (
            <p className="text-sm text-text-secondary text-center py-8">
              Aucune réservation récente
            </p>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <Avatar className="w-10 h-10 bg-primary">
                  <AvatarFallback>
                    <User className="w-5 h-5 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{booking.clientName}</p>
                  <p className="text-xs text-text-secondary">
                    {booking.pickupLocation} → {booking.dropoffLocation}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-text-primary">
                    {formatCurrency(booking.totalFare)}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {getTimeAgo(booking.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
