'use client';

import type { ApiRequest, HttpMethod } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { KeyValueEditor } from './key-value-editor';
import { Send, TestTube2 } from 'lucide-react';
import { AiAssistantDialog } from './ai-assistant-dialog';
import { parseCurl } from '@/lib/curl-parser';
import { useToast } from '@/hooks/use-toast';

interface RequestPanelProps {
  request: ApiRequest;
  onSend: () => void;
  onRequestChange: (request: ApiRequest) => void;
  isLoading: boolean;
}

const httpMethods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

const exampleRequest: Omit<ApiRequest, 'id'> = {
  method: 'POST',
  url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={{GEMINI_API_KEY}}',
  headers: [
    {
      id: crypto.randomUUID(),
      key: 'Content-Type',
      value: 'application/json',
      enabled: true,
    },
  ],
  params: [],
  body: JSON.stringify(
    {
      contents: [
        {
          parts: [{ text: 'Write a story about a magic backpack.' }],
        },
      ],
    },
    null,
    2
  ),
};

export function RequestPanel({ request, onSend, onRequestChange, isLoading }: RequestPanelProps) {
  const { toast } = useToast();

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onRequestChange({ ...request, url: e.target.value });
  };
  
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText.trim().toLowerCase().startsWith('curl')) {
      e.preventDefault();
      try {
        const parsedRequest = parseCurl(pastedText);
        onRequestChange({
          ...request,
          ...parsedRequest,
          id: request.id, // Keep the same ID
        });
         toast({
          title: "cURL command parsed",
          description: "The request details have been imported.",
        });
      } catch (error) {
        console.error("Failed to parse cURL command:", error);
        toast({
            title: "cURL Parse Error",
            description: "Could not parse the cURL command. Please check the format.",
            variant: "destructive",
        });
        // Fallback to just pasting the text if parsing fails
        onRequestChange({ ...request, url: pastedText });
      }
    }
  };

  const handleMethodChange = (method: HttpMethod) => {
    onRequestChange({ ...request, method });
  };

  const handleAiGenerate = (partialRequest: Partial<ApiRequest>) => {
    const newRequest = { ...request, ...partialRequest };
    if (partialRequest.headers) {
        newRequest.headers = partialRequest.headers;
    }
    onRequestChange(newRequest);
  };
  
  const handleLoadExample = () => {
    onRequestChange({
        ...request, // Keep id
        ...exampleRequest
    });
    toast({
        title: "Example Loaded",
        description: "A sample Gemini API request has been loaded. Don't forget to set your GEMINI_API_KEY in the variables.",
    });
  }

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg bg-card border">
      <div className="flex gap-2">
        <Select value={request.method} onValueChange={handleMethodChange}>
          <SelectTrigger className="w-[120px] font-semibold">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            {httpMethods.map(method => (
              <SelectItem key={method} value={method}>{method}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          placeholder="https://api.example.com/data or paste cURL command"
          value={request.url}
          onChange={handleUrlChange}
          onPaste={handlePaste}
        />
        <Button variant="outline" size="icon" onClick={handleLoadExample} title="Load Example Request">
            <TestTube2 className="h-4 w-4" />
            <span className="sr-only">Load Example</span>
        </Button>
        <AiAssistantDialog onGenerate={handleAiGenerate} />
        <Button onClick={onSend} disabled={isLoading || !request.url} className="w-[120px]">
          {isLoading ? 'Sending...' : <><Send className="mr-2 h-4 w-4" /> Send</>}
        </Button>
      </div>

      <Tabs defaultValue="params" className="w-full">
        <TabsList>
          <TabsTrigger value="params">Params</TabsTrigger>
          <TabsTrigger value="headers">Headers</TabsTrigger>
          <TabsTrigger value="body">Body</TabsTrigger>
        </TabsList>
        <TabsContent value="params" className="mt-4">
          <KeyValueEditor 
            items={request.params} 
            onChange={(params) => onRequestChange({...request, params})}
            keyPlaceholder="Key / Param"
            valuePlaceholder="Value"
          />
        </TabsContent>
        <TabsContent value="headers" className="mt-4">
          <KeyValueEditor 
            items={request.headers}
            onChange={(headers) => onRequestChange({...request, headers})}
            keyPlaceholder="Header"
            valuePlaceholder="Value"
          />
        </TabsContent>
        <TabsContent value="body" className="mt-4">
          <Textarea
            placeholder="Request body (e.g., JSON)"
            className="min-h-[200px] font-mono"
            value={request.body}
            onChange={(e) => onRequestChange({ ...request, body: e.target.value })}
            disabled={['GET', 'HEAD'].includes(request.method)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
