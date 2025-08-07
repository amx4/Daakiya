'use client';

import { useState } from 'react';
import type { ApiRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Clipboard } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface CodeSnippetViewerProps {
  request: ApiRequest;
}

function generateCurl(request: ApiRequest): string {
    let curl = `curl --location --request ${request.method} "${request.url}" \\\n`;

    request.headers.forEach(header => {
        if (header.enabled && header.key) {
        curl += `--header "${header.key}: ${header.value}" \\\n`;
        }
    });

    if (request.body && !['GET', 'HEAD'].includes(request.method)) {
        curl += `--data '${request.body}'`;
    }

    return curl.trim().replace(/ \\\n$/, '');
}

function generatePython(request: ApiRequest): string {
    let python = `import requests\nimport json\n\n`;
    python += `url = "${request.url}"\n\n`;

    if (request.body && !['GET', 'HEAD'].includes(request.method)) {
        try {
            const parsed = JSON.parse(request.body);
            python += `payload = json.dumps(${JSON.stringify(parsed, null, 2)})\n`;
        } catch (e) {
            python += `payload = """${request.body}"""\n`
        }
    } else {
        python += `payload = {}\n`;
    }

    python += `headers = {\n`;
    request.headers.forEach(header => {
        if (header.enabled && header.key) {
        python += `  '${header.key}': '${header.value}',\n`;
        }
    });
    python += `}\n\n`;

    python += `response = requests.request("${request.method}", url, headers=headers, data=payload)\n\n`;
    python += `print(response.text)`;

    return python;
}

function generateTypescript(request: ApiRequest): string {
    let ts = `const headers = new Headers();\n`;
     request.headers.forEach(header => {
        if (header.enabled && header.key) {
            ts += `headers.append("${header.key}", "${header.value}");\n`;
        }
    });

    ts += `\nconst requestOptions = {\n`;
    ts += `  method: '${request.method}',\n`;
    ts += `  headers: headers,\n`;
    if (request.body && !['GET', 'HEAD'].includes(request.method)) {
        ts += `  body: JSON.stringify(${request.body}),\n`;
    }
    ts += `  redirect: 'follow'\n`;
    ts += `};\n\n`;
    ts += `fetch("${request.url}", requestOptions)\n`;
    ts += `  .then(response => response.text())\n`;
    ts += `  .then(result => console.log(result))\n`;
    ts += `  .catch(error => console.log('error', error));`;
    
    return ts;
}

export function CodeSnippetViewer({ request }: CodeSnippetViewerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('curl');
  
  const snippets = {
      curl: generateCurl(request),
      python: generatePython(request),
      typescript: generateTypescript(request),
  };

  const copyToClipboard = () => {
    const snippet = snippets[activeTab as keyof typeof snippets];
    navigator.clipboard.writeText(snippet).then(() => {
        toast({ title: 'Copied to clipboard!' });
    }, (err) => {
        toast({ title: 'Failed to copy', description: err.message, variant: 'destructive' });
    });
  };

  return (
    <div className="flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
                <TabsTrigger value="curl">cURL</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
            </TabsList>
        </Tabs>
        <div className="relative flex-1 mt-2">
            <Card className="h-full">
                <CardContent className="p-0 h-full">
                    <ScrollArea className="h-full">
                        <pre className="text-sm p-4">
                            <code>{snippets[activeTab as keyof typeof snippets]}</code>
                        </pre>
                    </ScrollArea>
                </CardContent>
            </Card>
            <Button
                variant="ghost"
                size="icon"
                onClick={copyToClipboard}
                className="absolute top-2 right-2"
                title="Copy to clipboard"
            >
                <Clipboard className="h-4 w-4" />
            </Button>
        </div>
    </div>
  );
}
