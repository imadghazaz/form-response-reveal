
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Loader2, Clock, CheckCircle, Bot } from 'lucide-react';
import { ResponseAccordion } from './ResponseAccordion';
import { useToast } from '@/hooks/use-toast';
import { useJobPolling } from '@/hooks/useJobPolling';
import ProcessingFailure from './ProcessingFailure';

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
    pollingInterval: 20000,
    maxAttempts: 40
  });

  // Auto-start polling when jobId becomes available
  useEffect(() => {
    if (jobId && hasSubmitted && !isPolling) {
      startPolling();
    }
  }, [jobId, hasSubmitted, startPolling]);

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
        setJobId(id);
        
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
    if (!jobStatus) return 10;
    if (jobStatus.progress !== undefined) {
      return jobStatus.progress;
    }
    
    if (jobStatus.status === 'pending') return 25;
    if (jobStatus.status === 'processing') return 50;
    if (jobStatus.status === 'completed') return 100;
    if (jobStatus.status === 'failed') return 0;
    return 10;
  };

  const getStatusMessage = () => {
    if (!jobStatus) return processingMessage;
    
    if (jobStatus.message) {
      return jobStatus.message;
    }
    
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

  const handleRetry = () => {
    window.location.reload();
  };

  const isFormValid = webinarTopic.trim() && targetBuyer.trim();

  // Show form if not submitted
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

  // Show failure state if timeout or failed
  if (attempts >= maxAttempts || jobStatus?.status === 'failed' || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <ProcessingFailure 
            onRetry={handleRetry}
            jobId={jobId || undefined}
            attempts={attempts}
            maxAttempts={maxAttempts}
          />
        </div>
      </div>
    );
  }

  // Show completed state
  if (jobStatus?.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto">
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
                <ResponseAccordion responses={JSON.parse(jobStatus.result)} input={false} />
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show processing state
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-blue-200/50 scale-110"></div>
                <div className="relative z-10 p-3 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 backdrop-blur-sm">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 text-center">
                Processing Your Request
              </h1>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-4 max-w-lg border border-blue-100 flex items-start gap-3 animate-pulse">
              <Bot className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800 font-medium text-sm">
                {getStatusMessage()}
              </p>
            </div>
            
            <div className="w-full max-w-lg mb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-700">{getProgressValue()}%</span>
              </div>
              <Progress value={getProgressValue()} className="w-full h-3 shadow-lg" />
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-6">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Estimated time: {estimatedTime}</span>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 max-w-lg text-center border border-green-100">
              <p className="text-green-800 font-medium text-sm">
                Feel free to leave this page - we'll notify you when your content is ready!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AsyncFormTemplate;
