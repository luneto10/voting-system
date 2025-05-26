import { toast } from 'sonner';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        toast.error('Failed to copy link. Please try again.');
        return false;
      }
      
      textArea.remove();
    }
    
    toast.success('Link copied to clipboard!');
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    toast.error('Failed to copy link. Please try again.');
    return false;
  }
}; 