
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

const WebinarForm = () => {
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
      // Simulate API call - replace with your actual webhook URL
      const response = await fetch('https://johnkh.app.n8n.cloud/webhook-test/f0c319b3-2253-4d17-8d67-5949b553bce6', {
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
      
      // For demo purposes, I'll create mock responses
      // Replace this with: setResponses(data);
      const mockResponses: WebhookResponse[] = [
        {
          title: "Refined Topic + Desired Outcome",
          details: `**Refined Topic:** Discover quick and effective ${webinarTopic} designed specifically for ${targetBuyer}. This webinar will guide attendees through simple exercises that fit easily into a hectic daily schedule.\n\n**Specific Attendee Outcome:** After applying these routines, attendees will be able to consistently complete full-body workouts in just 10 minutes a day, leading to increased energy and improved fitness without sacrificing family time.\n\n**Desired Outcome:** "I want to finally get fit and feel more energetic, even with my busy schedule—without spending hours at the gym."`
        },
        {
          title: "Content Structure & Framework",
          details: `**Hook:** Start with a relatable pain point that ${targetBuyer} face daily - lack of time for fitness.\n\n**Problem Identification:** Highlight the common struggles of maintaining fitness with a busy lifestyle.\n\n**Solution Preview:** Introduce the concept of effective 10-minute routines that deliver real results.\n\n**Social Proof:** Share success stories from other busy parents who transformed their fitness journey.`
        },
        {
          title: "Marketing Angle & Positioning",
          details: `**Primary Angle:** "Finally, fitness that fits your life - not the other way around"\n\n**Value Proposition:** Transform your energy and confidence in just 10 minutes a day\n\n**Urgency Factor:** Limited-time access to exclusive workout library\n\n**Credibility Markers:** Evidence-based routines designed by certified trainers for busy lifestyles`
        }
      ];
      
      setResponses(data);
      setHasSubmitted(true);
      
      toast({
        title: "Success!",
        description: "Your webinar content has been generated successfully.",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {!hasSubmitted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            {!isLoading ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                  Webinar Content Generator
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
                      className="min-h-[60px] resize-none"
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
                      className="min-h-[60px] resize-none"
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
            {/* User Input Section */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-full mx-0 px-0">
                <h2>
                  <button 
                    className="w-full h-full outline-none flex items-start gap-6 py-5" 
                    type="button"
                    onClick={() => setIsUserInputExpanded(!isUserInputExpanded)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="10" r="3"></circle>
                        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
                      </svg>
                    </div>
                    <div className="flex-1 flex flex-col text-start">
                      <span className={`text-xl font-medium ${isUserInputExpanded ? 'text-blue-600' : 'text-gray-900'}`}>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 rounded-full bg-green-500"></div>
                            <h3>User Input - Webinar Topic Framing</h3>
                          </div>
                        </div>
                      </span>
                    </div>
                    <span className={`text-gray-400 transition-transform ${isUserInputExpanded ? '-rotate-90' : 'rotate-0'}`}>
                      <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none">
                        <path d="M15.5 19l-7-7 7-7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
                      </svg>
                    </span>
                  </button>
                </h2>
{isUserInputExpanded && (
                  <section style={{ overflow: 'hidden' }}>
                    <div className="py-2 ml-12 pb-8 pt-2">
                      <section className="flex w-full flex-col gap-4">
                        <div className="w-full">
                          <div className="flex w-full flex-col gap-4">
                            <div className="flex flex-col gap-4">
                              <div>
                                <div className="relative w-full">
                                  <div className="group flex flex-col w-full">
                                    <Label className="text-sm text-gray-500 pb-1.5">
                                      Your Webinar Topic Framing Eg."10 Minute Workout Routines" *
                                    </Label>
                                    <div className="w-full inline-flex items-center bg-gray-200 rounded-md py-1 px-3 shadow-sm">
                                      <Textarea
                                        value={webinarTopic}
                                        readOnly
                                        className="w-full bg-transparent border-none resize-none focus:outline-none text-sm h-6"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <div className="relative w-full">
                                  <div className="group flex flex-col w-full">
                                    <Label className="text-sm text-gray-500 pb-1.5">
                                      Your Ideal Target Buyer Eg. Working Mums *
                                    </Label>
                                    <div className="w-full inline-flex items-center bg-gray-200 rounded-md py-1 px-3 shadow-sm">
                                      <Textarea
                                        value={targetBuyer}
                                        readOnly
                                        className="w-full bg-transparent border-none resize-none focus:outline-none text-sm h-6"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </section>
                    </div>
                  </section>
                )}
              </div>
            </div>

            {/* Generated Content Section */}
            {responses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Content</h2>
                <ResponseAccordion responses={responses} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebinarForm;
