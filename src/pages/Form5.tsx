
import AsyncFormTemplate from '@/components/AsyncFormTemplate';

const Form5 = () => {
  return (
    <AsyncFormTemplate 
      title="Trend Analysis Generator"
      submitWebhookUrl="https://johnkh.app.n8n.cloud/webhook/trend-analysis-submit"
      statusWebhookUrl="https://johnkh.app.n8n.cloud/webhook/trend-analysis-status"
      processingMessage="We're generating your trend analysis. This usually takes 2–5 minutes. You'll get notified when it's ready."
      estimatedTime="2–5 minutes"
    />
  );
};

export default Form5;
