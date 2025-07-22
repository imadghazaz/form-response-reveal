import FormTemplate from '@/components/FormTemplate';
import { useLocation } from 'react-router-dom';

const SyncForm = () => {
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

export default SyncForm;