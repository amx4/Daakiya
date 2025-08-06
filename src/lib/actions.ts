'use server';

import type { ApiRequest, ApiResponse, Variable } from '@/lib/types';

function substituteVariables(text: string, variables: Variable[]): string {
  let substitutedText = text;
  const activeVariables = variables.filter(v => v.enabled);
  for (const variable of activeVariables) {
    const regex = new RegExp(`\\{\\{${variable.key}\\}\\}`, 'g');
    substitutedText = substitutedText.replace(regex, variable.value);
  }
  return substitutedText;
}

export async function executeRequest(
  request: ApiRequest,
  variables: Variable[]
): Promise<ApiResponse> {
  const startTime = Date.now();
  
  const substitutedUrl = substituteVariables(request.url, variables);

  const headers = new Headers();
  request.headers
    .filter(h => h.enabled && h.key)
    .forEach(h => {
        const subKey = substituteVariables(h.key, variables);
        const subValue = substituteVariables(h.value, variables);
        headers.append(subKey, subValue);
    });

  const substitutedBody = request.body ? substituteVariables(request.body, variables) : undefined;

  try {
    const response = await fetch(substitutedUrl, {
      method: request.method,
      headers: headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : substitutedBody,
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
