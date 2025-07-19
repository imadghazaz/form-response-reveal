
import { useState, useEffect, useCallback } from 'react';

interface JobStatus {
  id?: string;
  status?: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any[];
  error?: string;
  message?: string;
  progress?: number;
}

interface UseJobPollingProps {
  jobId: string | null;
  statusWebhookUrl: string;
  pollingInterval?: number;
  maxAttempts?: number;
}

export const useJobPolling = ({
  jobId,
  statusWebhookUrl,
  pollingInterval = 6000, // 6 seconds for testing
  maxAttempts = 10 // 10 attempts = 1 minute max
}: UseJobPollingProps) => {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkJobStatus = useCallback(async () => {
    if (!jobId) {
      return;
    }

    try {
      const response = await fetch(`${statusWebhookUrl}?id=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      const status: JobStatus = await response.json();
      setJobStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        setIsPolling(false);
      }
    } catch (err) {
      setError('Failed to check job status');
    }
  }, [jobId, statusWebhookUrl]);

  useEffect(() => {
    if (!jobId || !isPolling) {
      return;
    }

    if (attempts >= maxAttempts) {
      setIsPolling(false);
      setError('Job status check timed out');
      return;
    }

    // Check immediately when polling starts
    if (attempts === 0) {
      checkJobStatus();
      setAttempts(1);
    }

    // Set up interval for subsequent checks
    const interval = setInterval(() => {
      setAttempts(prev => {
        const newAttempts = prev + 1;
        
        if (newAttempts >= maxAttempts) {
          setIsPolling(false);
          setError('Job status check timed out');
          return newAttempts;
        }
        
        checkJobStatus();
        return newAttempts;
      });
    }, pollingInterval);

    return () => {
      clearInterval(interval);
    };
  }, [jobId, isPolling, checkJobStatus, pollingInterval, maxAttempts]);

  const startPolling = useCallback(() => {
    if (jobId) {
      setIsPolling(true);
      setAttempts(0);
      setError(null);
      setJobStatus(null);
    }
  }, [jobId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  return {
    jobStatus,
    isPolling,
    error,
    startPolling,
    stopPolling,
    attempts,
    maxAttempts
  };
};
