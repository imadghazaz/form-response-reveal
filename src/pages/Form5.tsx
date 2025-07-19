
import AsyncFormTemplate from '@/components/AsyncFormTemplate';

const Form5 = () => {
  return (
    <AsyncFormTemplate 
      title="Trend Analysis Generator"
      submitWebhookUrl="https://n8n.flowenix.com/webhook-test/7f157384-718c-4e31-a490-7ee4861a54b7"
      statusWebhookUrl="https://n8n.flowenix.com/webhook-test/1f25a3bc-8f1c-4e24-a624-ec3baf891c14"
      processingMessage="We're generating your trend analysis. This usually takes 2–5 minutes. You'll get notified when it's ready."
      estimatedTime="2–5 minutes"
    />
  );
};

export default Form5;
