
import AsyncFormTemplate from '@/components/AsyncFormTemplate';

const AsyncForm = () => {
  return (
    <AsyncFormTemplate 
      title="Trend Analysis Generator"
      submitWebhookUrl="https://johnkh.app.n8n.cloud/webhook/d652bf18-0e31-44ac-ab33-8454b953a20f"
      statusWebhookUrl="https://johnkh.app.n8n.cloud/webhook/1f25a3bc-8f1c-4e24-a624-ec3baf891c14"
      processingMessage="We're generating your trend analysis. This usually takes 2–5 minutes. You'll get notified when it's ready."
      estimatedTime="2–5 minutes"
    />
  );
};

export default AsyncForm;
