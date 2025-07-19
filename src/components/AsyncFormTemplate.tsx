import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Loader2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ResponseAccordion } from './ResponseAccordion';
import { useToast } from '@/hooks/use-toast';
import { useJobPolling } from '@/hooks/useJobPolling';

interface AsyncFormTemplateProps {
  title: string;
  submitWebhookUrl: string;
  statusWebhookUrl: string;
  processingMessage?: string;
  estimatedTime?: string;
}

const AsyncFormTemplate: React.FC<AsyncFormTemplateProps> = ({ 
  title, 
  submitWebhookUrl, 
  statusWebhookUrl,
  processingMessage = "We're generating your content. This usually takes 2–5 minutes.",
  estimatedTime = "2–5 minutes"
}) => {
  const [webinarTopic, setWebinarTopic] = useState('');
  const [targetBuyer, setTargetBuyer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { toast } = useToast();

  const { jobStatus, isPolling, error, startPolling, attempts, maxAttempts } = useJobPolling({
    jobId,
    statusWebhookUrl,
    pollingInterval: 6000, // 6 seconds for testing
    maxAttempts: 10 // 10 attempts = 1 minute total for testing
  });

  // Auto-start polling when jobId becomes available
  useEffect(() => {
    if (jobId && hasSubmitted && !isPolling) {
      startPolling();
    }
  }, [jobId, hasSubmitted, isPolling, startPolling]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webinarTopic.trim() || !targetBuyer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(submitWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          webinarTopic,
          targetBuyer,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const data = await response.json();
      
      if (data.jobId || data.id) {
        const id = data.jobId || data.id;
        setHasSubmitted(true);
        setJobId(id); // This will trigger the useEffect above to start polling
        
        toast({
          title: "Job Started!",
          description: "Your request has been submitted and is being processed.",
        });
      } else {
        throw new Error('No job ID returned from server');
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressValue = () => {
    console.log("progress",jobStatus.progress,"status",jobStatus.status)
    if (!jobStatus) return 10;
    
    // Use actual progress from API if available
    if (jobStatus.progress !== undefined) {
      return jobStatus.progress;
    }
    
    // Fallback to status-based progress
    if (jobStatus.status === 'pending') return 25;
    if (jobStatus.status === 'processing') return 50;
    if (jobStatus.status === 'completed') return 100;
    if (jobStatus.status === 'failed') return 0;
    return 10;
  };

  const getStatusIcon = () => {
    if (!jobStatus || jobStatus.status === 'pending' || jobStatus.status === 'processing') {
      return <Loader2 className="w-6 h-6 animate-spin text-blue-600" />;
    }
    if (jobStatus.status === 'completed') {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (jobStatus.status === 'failed') {
      return <XCircle className="w-6 h-6 text-red-600" />;
    }
    return <Clock className="w-6 h-6 text-gray-600" />;
  };

  const getStatusMessage = () => {
    console.log("message",jobStatus.message)
    if (!jobStatus) return processingMessage;
    
    // Use actual message from API if available
    if (jobStatus.message) {
      return jobStatus.message;
    }
    
    // Fallback to status-based messages
    switch (jobStatus.status) {
      case 'pending':
        return 'Your request is queued and will start processing shortly...';
      case 'processing':
        return 'Processing your request... Almost done!';
      case 'completed':
        return 'Your content has been generated successfully!';
      case 'failed':
        return jobStatus.error || 'An error occurred while processing your request.';
      default:
        return processingMessage;
    }
  };

  const isFormValid = webinarTopic.trim() && targetBuyer.trim();

  if (!hasSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {title}
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="webinar-topic" className="text-base font-medium text-gray-700">
                  Your Webinar Topic Framing Eg. "10 Minute Workout Routines" *
                </Label>
                <Textarea
                  id="webinar-topic"
                  placeholder="Type here"
                  value={webinarTopic}
                  onChange={(e) => setWebinarTopic(e.target.value)}
                  className="min-h-[40px] resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-buyer" className="text-base font-medium text-gray-700">
                  Your Ideal Target Buyer Eg. Working Mums *
                </Label>
                <Textarea
                  id="target-buyer"
                  placeholder="Type here"
                  value={targetBuyer}
                  onChange={(e) => setTargetBuyer(e.target.value)}
                  className="min-h-[40px] resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {jobStatus?.status !== 'completed' ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <div className="flex flex-col items-center justify-center py-8">
              {getStatusIcon()}
              
              <h2 className="text-2xl font-bold text-gray-900 mt-4 mb-2 text-center">
                {jobStatus?.status === 'failed' ? 'Processing Failed' : 'Processing Your Request'}
              </h2>
              
              <div className="text-center mb-6 max-w-md">
                <p className="text-gray-600 mb-2">
                  {getStatusMessage()}
                </p>
                {jobStatus?.progress !== undefined && (
                  <div className="text-sm text-blue-600 font-medium">
                    {Math.round(getProgressValue())}% Complete
                  </div>
                )}
              </div>

              {jobStatus?.status !== 'failed' && (
                <div className="w-full max-w-md space-y-4">
                  <Progress value={getProgressValue()} className="w-full" />
                  
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Progress</span>
                    <span>{Math.round(getProgressValue())}%</span>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Estimated time: {estimatedTime}</span>
                    </div>
                    <div className="mt-2">
                      <div className="text-xs text-blue-600">
                        Status checks: {attempts}/{maxAttempts} | Polling: {isPolling ? 'Active' : 'Inactive'}
                      </div>
                      {jobId && (
                        <div className="text-xs text-gray-400 mt-1">
                          Job ID: {jobId}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {(jobStatus?.status === 'failed' || error) && (
                <Button
                  onClick={() => window.location.reload()}
                  className="mt-4"
                  variant="outline"
                >
                  Try Again
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-8 gap-4 flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
              <ResponseAccordion 
                responses={[{
                  title: "User Input - Webinar Topic Framing",
                  details: { webinarTopic, targetBuyer }
                }]} 
                input={true}
              />
              {jobStatus?.result && (
                <ResponseAccordion responses={jobStatus.result} input={false} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AsyncFormTemplate;
