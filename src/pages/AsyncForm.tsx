
import AsyncFormTemplate from '@/components/AsyncFormTemplate';

const AsyncForm = () => {
  return (
    <AsyncFormTemplate 
      title="'Slam Dunk’ Webinar Topics."
      submitWebhookUrl="https://johnkh.app.n8n.cloud/webhook/d652bf18-0e31-44ac-ab33-8454b953a20f"
      statusWebhookUrl="https://johnkh.app.n8n.cloud/webhook-test/e4205c86-fed9-4d11-b2a7-c065e00749ce"
      processingMessage="Initializing... Receiving input and preparing queries"
      estimatedTime="8–10 minutes"
    />
  );
};

export default AsyncForm;
