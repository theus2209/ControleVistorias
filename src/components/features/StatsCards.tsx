import { VistoriaStats } from '@/types';
import { ClipboardList, CheckCircle2, Clock, FileCheck, CreditCard, Banknote } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface StatsCardsProps {
  stats: VistoriaStats;
}

export const StatsCards = ({ stats }: StatsCardsProps) => {
  const cards = [
    {
      label: 'Total de Vistorias',
      value: stats.total,
      icon: ClipboardList,
      gradient: 'from-emerald-500 to-green-600'
    },
    {
      label: 'Pagas',
      value: stats.pagas,
      icon: CheckCircle2,
      gradient: 'from-green-500 to-emerald-600'
    },
    {
      label: 'Pix',
      value: stats.pix,
      icon: CreditCard,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Dinheiro',
      value: stats.dinheiro,
      icon: Banknote,
      gradient: 'from-teal-500 to-teal-600'
    },
    {
      label: 'Pendentes',
      value: stats.pendentes,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600'
    },
    {
      label: 'Com Nota Fiscal',
      value: stats.comNF,
      icon: FileCheck,
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="p-4 bg-gradient-to-br from-white to-emerald-50 border-emerald-100 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-md`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <p className="text-xl font-bold text-foreground">{card.value}</p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
