'use client';

import type { ApiResponse } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from './ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

interface ResponsePanelProps {
  response: ApiResponse | null;
  isLoading: boolean;
}

function PrettyPrintJson({ data }: { data: any }) {
    try {
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
        // Attempt to parse to validate, then re-stringify to format
        const parsed = JSON.parse(jsonString);
        return <pre className="text-sm"><code>{JSON.stringify(parsed, null, 2)}</code></pre>;
    } catch (error) {
        return <pre className="text-sm text-destructive"><code>{typeof data === 'string' ? data : JSON.stringify(data)}</code></pre>;
    }
}

export function ResponsePanel({ response, isLoading }: ResponsePanelProps) {
    if (isLoading) {
        return (
            <Card className="flex-1">
                <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-6 w-48" />
                    </div>
                    <Skeleton className="h-48 w-full" />
                </CardContent>
            </Card>
        );
    }

  if (!response) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 rounded-lg bg-card border text-muted-foreground">
        <p>Send a request to see the response here.</p>
      </div>
    );
  }

  const getStatusVariant = (status: number) => {
    if (status >= 200 && status < 300) return 'default';
    if (status >= 400 && status < 500) return 'destructive';
    if (status >= 500) return 'destructive';
    return 'secondary';
  };

  return (
    <div className="flex flex-col flex-1 rounded-lg bg-card border">
        <div className="flex items-center gap-4 p-4 border-b">
            <h2 className="text-lg font-semibold">Response</h2>
            {response.status > 0 && (
                <>
                <Badge variant={getStatusVariant(response.status)}>Status: {response.status} {response.statusText}</Badge>
                <Badge variant="secondary">Time: {response.time}ms</Badge>
                <Badge variant="secondary">Size: {(response.size / 1024).toFixed(2)} KB</Badge>
                </>
            )}
             {response.status === 0 && (
                <Badge variant="destructive">Error: {response.statusText}</Badge>
             )}
        </div>
        <div className="p-4 flex-1">
            <Tabs defaultValue="body" className="w-full h-full flex flex-col">
                <TabsList>
                    <TabsTrigger value="body">Body</TabsTrigger>
                    <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                <TabsContent value="body" className="mt-4 flex-1 overflow-auto">
                    <PrettyPrintJson data={response.body} />
                </TabsContent>
                <TabsContent value="headers" className="mt-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Header</TableHead>
                                <TableHead>Value</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Object.entries(response.headers).map(([key, value]) => (
                                <TableRow key={key}>
                                    <TableCell className="font-medium">{key}</TableCell>
                                    <TableCell>{value}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    </div>
  );
}
