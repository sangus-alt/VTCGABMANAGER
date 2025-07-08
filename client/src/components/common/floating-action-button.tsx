import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function FloatingActionButton() {
  const [location, navigate] = useLocation();

  const handleClick = () => {
    // Navigate to appropriate form based on current page
    if (location.includes('drivers')) {
      navigate('/drivers/new');
    } else if (location.includes('vehicles')) {
      navigate('/vehicles/new');
    } else if (location.includes('bookings')) {
      navigate('/bookings/new');
    } else {
      navigate('/bookings/new');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleClick}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
