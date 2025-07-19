
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
  pollingInterval = 6000, // 6 seconds for testing
  maxAttempts = 10 // 10 attempts = 1 minute max
}: UseJobPollingProps) => {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  console.log("useJobPolling hook initialized", { jobId, isPolling, attempts });

  const checkJobStatus = useCallback(async () => {
    console.log("checkJobStatus called with jobId:", jobId);
    if (!jobId) {
      console.log("No jobId, skipping status check");
      return;
    }

    try {
      console.log(`Making status request to: ${statusWebhookUrl}?id=${jobId}`);
      const response = await fetch(`${statusWebhookUrl}?id=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log("Status response received:", response.status, response.ok);

      if (!response.ok) {
        throw new Error(`Failed to check job status: ${response.status}`);
      }

      const status: JobStatus = await response.json();
      console.log("Job status received:", status);
      setJobStatus(status);

      if (status.status === 'completed' || status.status === 'failed') {
        console.log("Job finished, stopping polling");
        setIsPolling(false);
      }
    } catch (err) {
      console.error('Error checking job status:', err);
      setError('Failed to check job status');
    }
  }, [jobId, statusWebhookUrl]);

  useEffect(() => {
    console.log("Polling effect triggered", { jobId, isPolling, attempts, maxAttempts });
    
    if (!jobId || !isPolling) {
      console.log("Not polling - jobId:", jobId, "isPolling:", isPolling);
      return;
    }

    if (attempts >= maxAttempts) {
      console.log("Max attempts reached, stopping polling");
      setIsPolling(false);
      setError('Job status check timed out');
      return;
    }

    // Check immediately when polling starts
    if (attempts === 0) {
      console.log("First attempt - checking status immediately");
      checkJobStatus();
      setAttempts(1);
    }

    // Set up interval for subsequent checks
    const interval = setInterval(() => {
      console.log("Interval tick - attempt", attempts + 1);
      setAttempts(prev => {
        const newAttempts = prev + 1;
        console.log(`Status check attempt ${newAttempts}/${maxAttempts}`);
        
        if (newAttempts >= maxAttempts) {
          console.log("Reached max attempts, stopping");
          setIsPolling(false);
          setError('Job status check timed out');
          return newAttempts;
        }
        
        checkJobStatus();
        return newAttempts;
      });
    }, pollingInterval);

    return () => {
      console.log("Cleaning up interval");
      clearInterval(interval);
    };
  }, [jobId, isPolling, checkJobStatus, pollingInterval, maxAttempts]);

  const startPolling = useCallback(() => {
    console.log("startPolling called with jobId:", jobId);
    if (jobId) {
      console.log("Starting polling process");
      setIsPolling(true);
      setAttempts(0);
      setError(null);
      setJobStatus(null);
    } else {
      console.log("Cannot start polling - no jobId");
    }
  }, [jobId]);

  const stopPolling = useCallback(() => {
    console.log("stopPolling called");
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
