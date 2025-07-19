
import React from 'react';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Mail } from 'lucide-react';

interface ProcessingFailureProps {
  onRetry: () => void;
  jobId?: string;
  attempts: number;
  maxAttempts: number;
}

const ProcessingFailure: React.FC<ProcessingFailureProps> = ({ 
  onRetry, 
  jobId, 
  attempts, 
  maxAttempts 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative mb-8">
          <div className="p-6 rounded-full bg-red-50 border-4 border-red-100">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
          Processing Timeout
        </h2>
        
        <div className="text-center mb-8 max-w-lg space-y-4">
          <p className="text-lg text-gray-600">
            Your request is taking longer than expected. This can happen during high traffic periods.
          </p>
          <p className="text-base text-gray-500">
            Don't worry - your request is still being processed in the background.
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-6 mb-8 max-w-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What you can do:</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Try refreshing in a few minutes</li>
            <li>• Check your email for completion notification</li>
            <li>• Contact support if this persists</li>
          </ul>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={() => window.open('mailto:support@example.com?subject=Processing%20Timeout&body=Job%20ID:%20' + jobId, '_blank')}
            variant="outline"
            className="px-6 py-2"
          >
            <Mail className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </div>

        <div className="mt-6 text-xs text-gray-400 text-center">
          <div>Status checks: {attempts}/{maxAttempts}</div>
          {jobId && (
            <div className="mt-1">Job ID: {jobId}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessingFailure;
