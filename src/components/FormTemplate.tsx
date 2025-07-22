import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowRight, Loader2 } from 'lucide-react';
import { ResponseAccordion } from './ResponseAccordion';
import { useToast } from '@/hooks/use-toast';

interface WebhookResponse {
  title: string;
  details: string;
}

interface FormTemplateProps {
  title: string;
  webhookUrl: string;
}

const FormTemplate: React.FC<FormTemplateProps> = ({ title, webhookUrl }) => {
  const [webinarTopic, setWebinarTopic] = useState('');
  const [targetBuyer, setTargetBuyer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [responses, setResponses] = useState<WebhookResponse[]>([]);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isUserInputExpanded, setIsUserInputExpanded] = useState(true);
  const { toast } = useToast();

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

    setIsLoading(true);
    setHasSubmitted(false);

    try {
      const response = await fetch(webhookUrl, {
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
      
      setResponses(data);
      setHasSubmitted(true);
      
      toast({
        title: "Success!",
        description: "Your content has been generated successfully.",
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = webinarTopic.trim() && targetBuyer.trim();

  return (
    <div className="min-h-screen  py-8 px-4" style={{ backgroundColor: 'rgb(246, 246, 246)' }}>
      <div className="max-w-4xl mx-auto">
        {!hasSubmitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {!isLoading ? (
              <>
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
                      className="h-[40px] resize-none"
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
                      className="h-[40px] resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={!isFormValid || isLoading}
                    className="w-full h-12 text-base font-medium bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600">Generating Content...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Generated Content Section */}
            {responses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8 gap-4 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                <ResponseAccordion responses={[{title:"User Input - Webinar Topic Framing",details:{webinarTopic,targetBuyer}}]} input={true}/>
                <ResponseAccordion responses={responses} input={false}/>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FormTemplate;