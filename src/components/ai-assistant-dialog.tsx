'use client';

import { useState } from 'react';
import { generateRequestFromDescription } from '@/ai/flows/generate-request-from-description';
import type { ApiRequest } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

interface AiAssistantDialogProps {
  onGenerate: (partialRequest: Partial<ApiRequest>) => void;
}

export function AiAssistantDialog({ onGenerate }: AiAssistantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a description for the request.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateRequestFromDescription({ description });
      const headers = Object.entries(result.headers || {}).map(([key, value]) => ({
        id: crypto.randomUUID(),
        key,
        value,
        enabled: true,
      }));
      
      onGenerate({
        url: result.url,
        headers,
        body: result.body,
      });

      toast({
        title: 'Success',
        description: 'Request details have been populated.',
      });
      setIsOpen(false);
      setDescription('');
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        title: 'AI Generation Failed',
        description: 'Could not generate request details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Sparkles className="h-4 w-4" />
          <span className="sr-only">AI Assistant</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Request Assistant</DialogTitle>
          <DialogDescription>
            Describe the API request you want to make, and the AI will fill in the details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Textarea
            id="description"
            placeholder="e.g., 'Make a POST request to /users with a JSON body containing name and email.'"
            className="min-h-[120px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isGenerating}
          />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setIsOpen(false)} disabled={isGenerating}>Cancel</Button>
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
