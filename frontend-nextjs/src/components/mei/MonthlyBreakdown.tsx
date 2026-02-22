import { MonthlyMeiRevenueDto } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { formatCurrency, formatPercentage } from '@/lib/utils/format';

interface MonthlyBreakdownProps {
  months: MonthlyMeiRevenueDto[];
}

export function MonthlyBreakdown({ months }: MonthlyBreakdownProps) {
  const currentMonth = new Date().getMonth() + 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Breakdown Mensal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mês
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Limite Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % Usado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {months.map((month) => {
                const isCurrentMonth = month.month === currentMonth;
                const hasRevenue = month.revenue > 0;

                return (
                  <tr
                    key={month.month}
                    className={isCurrentMonth ? 'bg-emerald-50' : ''}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {month.monthName}
                        </span>
                        {isCurrentMonth && (
                          <Badge variant="info" className="ml-2">
                            Atual
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {hasRevenue ? formatCurrency(month.revenue) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatCurrency(month.limit)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={
                          month.isOverLimit
                            ? 'text-red-600 font-semibold'
                            : month.percentageUsed > 80
                            ? 'text-yellow-600 font-semibold'
                            : 'text-gray-900'
                        }
                      >
                        {hasRevenue ? formatPercentage(month.percentageUsed) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasRevenue && (
                        <Badge
                          variant={
                            month.isOverLimit
                              ? 'danger'
                              : month.percentageUsed > 80
                              ? 'warning'
                              : 'success'
                          }
                        >
                          {month.isOverLimit
                            ? 'Acima do limite'
                            : month.percentageUsed > 80
                            ? 'Atenção'
                            : 'Normal'}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
