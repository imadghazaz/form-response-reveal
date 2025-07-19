
import { useState, useEffect, useCallback } from 'react';

interface JobStatus {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: any[];
  error?: string;
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
  pollingInterval = 60000, // 1 minute
  maxAttempts = 10 // 10 minutes max
}: UseJobPollingProps) => {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const checkJobStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`${statusWebhookUrl}?id=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check job status');
      }

      const status: JobStatus = await response.json();
      setJobStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Error checking job status:', err);
      setError('Failed to check job status');
    }
  }, [jobId, statusWebhookUrl]);

  useEffect(() => {
    if (!jobId || !isPolling) return;

    const interval = setInterval(() => {
      setAttempts(prev => {
        if (prev >= maxAttempts) {
          setIsPolling(false);
          setError('Job status check timed out');
          return prev;
        }
        checkJobStatus();
        return prev + 1;
      });
    }, pollingInterval);

    // Check immediately
    checkJobStatus();

    return () => clearInterval(interval);
  }, [jobId, isPolling, checkJobStatus, pollingInterval, maxAttempts]);

  const startPolling = useCallback(() => {
    if (jobId) {
      setIsPolling(true);
      setAttempts(0);
      setError(null);
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
