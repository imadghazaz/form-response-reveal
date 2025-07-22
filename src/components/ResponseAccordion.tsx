import React, { useState } from 'react';
import { Bot, ChevronDown, Copy, RefreshCcw, PenSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { marked } from "marked";
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface WebhookResponse {
  title: string;
  details: any;
}

interface ResponseAccordionProps {
  responses: WebhookResponse[];
  input: boolean;
}

export const ResponseAccordion: React.FC<ResponseAccordionProps> = ({ responses, input }) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set([0]));
  const { toast } = useToast();

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  const handleCopy = async (content: string, title: string) => {
    try {
      console.log(content);
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: `${title} content copied to clipboard.`,
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard.",
        variant: "destructive",
      });
    }
  };


  if (!input) return (
    <div className="space-y-4">
      {responses.map((response, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-start gap-6 p-6 text-left hover:bg-gray-50 transition-colors duration-200"
            aria-expanded={openItems.has(index)}
          >
            <div className="flex-shrink-0 mt-1">
              <Bot className="h-6 w-6 text-green-600" />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <h3 className={`text-xl font-medium transition-colors duration-200 ${openItems.has(index) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                  {response.title}
                </h3>
              </div>
            </div>

            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openItems.has(index) ? 'rotate-180' : ''
                }`}
            />
          </button>

          {openItems.has(index) && (
            <div className="px-6 pb-6">
              <div className="ml-12">
                <div className="inline-flex items-center gap-3 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                  <Bot className="h-4 w-4" />
                  <span>AI Generated Content</span>
                </div>

                <div className="mb-4">
                  <div className="flex gap-2">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        toast({
                          title: "Regenerate",
                          description: "Regeneration feature would be implemented here.",
                        });
                      }}
                    >
                      <RefreshCcw className="h-3 w-3 mr-1" />
                      Regenerate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        toast({
                          title: "Edit",
                          description: "Edit feature would be implemented here.",
                        });
                      }}
                    >
                      <PenSquare className="h-3 w-3 mr-1" />
                      Edit
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => handleCopy(response.details, response.title)}
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </Button>
                  </div>
                </div>

                <div
                  className="prose prose-sm max-w-none space-y-3"
                  dangerouslySetInnerHTML={{ __html: marked.parse(response.details) }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ); else return (
    <div className="space-y-4">
      {responses.map((response, index) => (
        <div
          key={index}
          className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full flex items-start gap-6 p-6 text-left hover:bg-gray-50 transition-colors duration-200"
            aria-expanded={openItems.has(index)}
          >
            <div className="flex-shrink-0 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="10" r="3"></circle>
                <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
              </svg>
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-1">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <h3 className={`text-xl font-medium transition-colors duration-200 ${openItems.has(index) ? 'text-blue-600' : 'text-gray-900'
                  }`}>
                  {response.title}
                </h3>
              </div>
            </div>

            <ChevronDown
              className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${openItems.has(index) ? 'rotate-180' : ''
                }`}
            />
          </button>

          {openItems.has(index) && (
            <div className="px-6 pb-6">
              <div className="ml-12">

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
                                value={response.details.webinarTopic}
                                readOnly
                                className="w-fullh-[40px] py-0 bg-transparent border-none resize-none focus:outline-none text-sm h-6"
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
                                value={response.details.targetBuyer}
                                readOnly
                                className="w-full h-[40px] py-0 bg-transparent border-none resize-none focus:outline-none text-sm h-6"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
};
