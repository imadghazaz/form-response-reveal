
import AsyncFormTemplate from '@/components/AsyncFormTemplate';

const AsyncForm = () => {
  return (
    <AsyncFormTemplate 
      title="'Slam Dunk’ Webinar Topics."
      submitWebhookUrl="https://johnkh.app.n8n.cloud/webhook/d652bf18-0e31-44ac-ab33-8454b953a20f"
      statusWebhookUrl="https://johnkh.app.n8n.cloud/webhook/1f25a3bc-8f1c-4e24-a624-ec3baf891c14"
      processingMessage="Initializing... Receiving input and preparing queries"
      estimatedTime="2–5 minutes"
    />
  );
};

export default AsyncForm;
