import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Banknote, Smartphone, CreditCard } from "lucide-react";
import { formatCurrency } from "@/lib/constants";

interface PaymentSummaryProps {
  summary: {
    cash: number;
    mobile: number;
    card: number;
    total: number;
  };
}

export default function PaymentSummary({ summary }: PaymentSummaryProps) {
  const paymentMethods = [
    {
      name: 'Espèces',
      amount: summary.cash,
      icon: Banknote,
      color: 'text-green-600',
    },
    {
      name: 'Mobile Money',
      amount: summary.mobile,
      icon: Smartphone,
      color: 'text-blue-600',
    },
    {
      name: 'Carte Bancaire',
      amount: summary.card,
      icon: CreditCard,
      color: 'text-purple-600',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Résumé Paiements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <div key={method.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Icon className={`w-5 h-5 ${method.color}`} />
                  <span className="text-sm text-text-primary">{method.name}</span>
                </div>
                <span className="text-sm font-medium text-text-primary">
                  {formatCurrency(method.amount)}
                </span>
              </div>
            );
          })}
          
          <div className="border-t pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-text-primary">Total</span>
              <span className="text-lg font-bold text-text-primary">
                {formatCurrency(summary.total)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
