import FormTemplate from '@/components/FormTemplate';

const Form1 = () => {
  return (
    <FormTemplate 
      title="Webinar Content Generator"
      webhookUrl="https://johnkh.app.n8n.cloud/webhook/f0c319b3-2253-4d17-8d67-5949b553bce6"
    />
  );
};

const Form13 = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const title = params.get('title');
  const webhookUrl = params.get('webhookurl');

  
  return (
    <FormTemplate 
      title={title}
      webhookUrl={webhookUrl}
    />
  );
};

export default Form1;