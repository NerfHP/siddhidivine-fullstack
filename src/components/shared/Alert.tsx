import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface AlertProps {
  type: 'info' | 'success' | 'error';
  message: string;
}

const alertConfig = {
  info: {
    icon: <AlertCircle className="h-5 w-5 text-blue-400" />,
    classes: 'bg-blue-50 border-blue-400 text-blue-700',
  },
  success: {
    icon: <CheckCircle className="h-5 w-5 text-green-400" />,
    classes: 'bg-green-50 border-green-400 text-green-700',
  },
  error: {
    icon: <XCircle className="h-5 w-5 text-red-400" />,
    classes: 'bg-red-50 border-red-400 text-red-700',
  },
};

export default function Alert({ type, message }: AlertProps) {
  const { icon, classes } = alertConfig[type];

  return (
    <div className={`rounded-md border p-4 ${classes}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}