import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
  compact?: boolean;
}

const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Ocorreu um erro',
  message,
  onRetry,
  className,
  compact = false
}) => {
  return (
    <Card className={className}>
      <div className={`text-center ${compact ? 'py-6' : 'py-12'}`}>
        <AlertTriangle className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-red-500 mx-auto mb-4`} />
        <h3 className={`${compact ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-2`}>{title}</h3>
        <p className="text-gray-600 mb-6 max-w-sm mx-auto">{message}</p>
        {onRetry && (
          <Button onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ErrorState;