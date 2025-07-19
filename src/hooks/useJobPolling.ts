
import { useState, useEffect, useCallback, useRef } from 'react';

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
  
  // Use refs to ensure we have access to latest values in interval callbacks
  const attemptsRef = useRef(0);
  const isPollingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync refs with state
  useEffect(() => {
    attemptsRef.current = attempts;
  }, [attempts]);

  useEffect(() => {
    isPollingRef.current = isPolling;
  }, [isPolling]);

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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    } catch (err) {
      setError('Failed to check job status');
    }
  }, [jobId, statusWebhookUrl]);

  // Main polling effect
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (!jobId || !isPolling) {
      return;
    }

    // Check immediately when polling starts
    if (attempts === 0) {
      checkJobStatus();
      setAttempts(1);
      attemptsRef.current = 1;
    }

    // Set up interval for subsequent checks
    intervalRef.current = setInterval(() => {
      const currentAttempts = attemptsRef.current;
      
      // Check if we've reached max attempts
      if (currentAttempts >= maxAttempts) {
        setIsPolling(false);
        setError('Job status check timed out');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }
      
      // Only continue if still polling
      if (isPollingRef.current) {
        const newAttempts = currentAttempts + 1;
        setAttempts(newAttempts);
        attemptsRef.current = newAttempts;
        checkJobStatus();
      }
    }, pollingInterval);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, isPolling, checkJobStatus, pollingInterval, maxAttempts]);

  const startPolling = useCallback(() => {
    if (jobId) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      
      setIsPolling(true);
      setAttempts(0);
      attemptsRef.current = 0;
      setError(null);
      setJobStatus(null);
    }
  }, [jobId]);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
