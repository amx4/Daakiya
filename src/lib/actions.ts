'use server';

import type { ApiRequest, ApiResponse, KeyValue, Variable } from '@/lib/types';

function substituteVariables(text: string, variables: (Variable | KeyValue)[]): string {
  let substitutedText = text;
  const activeVariables = variables.filter(v => v.enabled);
  for (const variable of activeVariables) {
    if (!variable.key) continue;
    
    // Postman-style environment variables: {{variable}}
    const envRegex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
    substitutedText = substitutedText.replace(envRegex, variable.value);
  }
  return substitutedText;
}

export async function executeRequest(
  request: ApiRequest,
  variables: Variable[]
): Promise<ApiResponse> {
  const startTime = Date.now();
  
  const allVariables = [...variables, ...request.params];
  
  let substitutedUrl = substituteVariables(request.url, allVariables);

  try {
    // Now that the main URL is substituted, append query params
    const url = new URL(substitutedUrl);

    request.params
      .filter(p => p.enabled && p.key)
      .forEach(p => {
        // Only append if it wasn't a placeholder in the original URL
        if (!request.url.includes(`{{${p.key}}}`)) {
           url.searchParams.append(substituteVariables(p.key, allVariables), substituteVariables(p.value, allVariables));
        }
      });
      
    substitutedUrl = url.toString();

  } catch (error) {
    // This can happen if substitutedUrl is still not a full valid URL.
    // We'll let fetch handle it, as it might be a relative path.
    console.warn("Could not construct URL object, proceeding with fetch:", error);
  }


  const headers = new Headers();
  request.headers
    .filter(h => h.enabled && h.key)
    .forEach(h => {
        const subKey = substituteVariables(h.key, allVariables);
        const subValue = substituteVariables(h.value, allVariables);
        headers.append(subKey, subValue);
    });

  const substitutedBody = request.body ? substituteVariables(request.body, allVariables) : undefined;

  try {
    const response = await fetch(substitutedUrl, {
      method: request.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : substitutedBody,
      cache: 'no-store',
    });

    const endTime = Date.now();
    const time = endTime - startTime;

    const responseBodyText = await response.text();
    const size = new Blob([responseBodyText]).size;
    
    let body;
    try {
        body = JSON.parse(responseBodyText);
    } catch (e) {
        body = responseBodyText;
    }

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body,
      time,
      size,
    };
  } catch (error: any) {
    const endTime = Date.now();
    return {
        status: 0,
        statusText: 'Request Failed',
        headers: {},
        body: error.message || 'Could not connect to the server.',
        time: endTime - startTime,
        size: 0,
    }
  }
}
