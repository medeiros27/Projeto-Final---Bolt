import React from 'react';
import LoadingSpinner from './LoadingSpinner';
import Card from './Card';

interface LoadingStateProps {
  text?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  text = 'Carregando...',
  className,
  size = 'md',
  fullPage = false
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center py-12">
      <LoadingSpinner size={size} />
      {text && <p className="mt-4 text-gray-600">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <Card className={className}>
      {content}
    </Card>
  );
};

export default LoadingState;