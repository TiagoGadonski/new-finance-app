import { MeiAlertDto } from '@/types';
import { Alert } from '@/components/ui';

interface MeiAlertsProps {
  alerts: MeiAlertDto[];
}

export function MeiAlerts({ alerts }: MeiAlertsProps) {
  if (!alerts || alerts.length === 0) return null;

  const getAlertVariant = (level: string) => {
    switch (level) {
      case 'critical':
        return 'danger' as const;
      case 'danger':
        return 'danger' as const;
      case 'warning':
        return 'warning' as const;
      default:
        return 'info' as const;
    }
  };

  return (
    <div className="space-y-4">
      {alerts.map((alert, index) => (
        <Alert
          key={index}
          variant={getAlertVariant(alert.level)}
          title={alert.message}
        >
          <p className="mb-2">{alert.recommendation}</p>
          <div className="text-xs opacity-75">
            Percentual utilizado: {alert.percentageUsed.toFixed(1)}%
          </div>
        </Alert>
      ))}
    </div>
  );
}
