import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, Check, ExternalLink } from 'lucide-react';
import { copyToClipboard } from '@/lib/clipboard';

interface SubmissionLinkProps {
  formId: number;
  formTitle: string;
}

export default function SubmissionLink({ formId, formTitle }: SubmissionLinkProps) {
  const [copied, setCopied] = useState(false);
  
  const submissionUrl = `${window.location.origin}/polls/${formId}/submit`;

  const handleCopy = async () => {
    const success = await copyToClipboard(submissionUrl);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInNewTab = () => {
    window.open(submissionUrl, '_blank');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Share This Form</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share this link with users so they can submit their responses to "{formTitle}"
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={submissionUrl}
            readOnly
            className="flex-1 font-mono text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openInNewTab}
            className="flex-shrink-0"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>💡 <strong>Tip:</strong> Users will need to be logged in to submit responses.</p>
          <p>If they're not logged in, they'll be redirected to the login page first.</p>
        </div>
      </CardContent>
    </Card>
  );
} 