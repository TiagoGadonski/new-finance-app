import { MeiDashboardDto } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';
import { TrendingUp, TrendingDown, DollarSign, AlertCircle } from 'lucide-react';
import { MonthlyBreakdown } from './MonthlyBreakdown';

interface MeiDashboardProps {
  dashboard: MeiDashboardDto;
}

export function MeiDashboard({ dashboard }: MeiDashboardProps) {
  const progressPercentage = Math.min(dashboard.percentageUsed, 100);
  const isOverLimit = dashboard.percentageUsed > 100;
  const isAtRisk = dashboard.isAtRisk;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Atual</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(dashboard.currentRevenue)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Limite Proporcional</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {formatCurrency(dashboard.proportionalLimit)}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Restante</p>
                <p className={`text-2xl font-bold mt-2 ${dashboard.remainingRevenue < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(dashboard.remainingRevenue)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${dashboard.remainingRevenue < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                {dashboard.remainingRevenue < 0 ? (
                  <TrendingDown className="w-6 h-6 text-red-600" />
                ) : (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Percentual Usado</p>
                <p className={`text-2xl font-bold mt-2 ${isOverLimit ? 'text-red-600' : isAtRisk ? 'text-yellow-600' : 'text-gray-900'}`}>
                  {formatPercentage(dashboard.percentageUsed)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${isOverLimit ? 'bg-red-100' : isAtRisk ? 'bg-yellow-100' : 'bg-green-100'}`}>
                {isOverLimit || isAtRisk ? (
                  <AlertCircle className={`w-6 h-6 ${isOverLimit ? 'text-red-600' : 'text-yellow-600'}`} />
                ) : (
                  <TrendingUp className="w-6 h-6 text-green-600" />
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progresso Anual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progresso</span>
              <span>{formatPercentage(progressPercentage)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  isOverLimit
                    ? 'bg-red-600'
                    : isAtRisk
                    ? 'bg-yellow-500'
                    : 'bg-green-600'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>R$ 0</span>
              <span>{formatCurrency(dashboard.proportionalLimit)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Média Mensal Ideal</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(dashboard.monthlyAverageLimit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Receita do Mês Atual</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(dashboard.currentMonthRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Projeção Anual</p>
              <p className={`text-lg font-semibold mt-1 ${dashboard.projectedAnnualRevenue > dashboard.proportionalLimit ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(dashboard.projectedAnnualRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Limite Anual</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">
                {formatCurrency(dashboard.annualRevenueLimit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {dashboard.alertMessage && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-yellow-800 font-medium">{dashboard.alertMessage}</p>
          </CardContent>
        </Card>
      )}

      <MonthlyBreakdown months={dashboard.monthlyBreakdown} />
    </div>
  );
}
