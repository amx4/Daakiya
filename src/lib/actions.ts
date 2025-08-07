'use server';

import type { ApiRequest, ApiResponse, KeyValue, Variable } from '@/lib/types';

function substituteVariables(text: string, variables: (Variable | KeyValue)[]): string {
  let substitutedText = text;
  const activeVariables = variables.filter(v => v.enabled);
  for (const variable of activeVariables) {
    if (!variable.key) continue;
    // Postman-style path variables: :variable
    const pathRegex = new RegExp(`:${variable.key}`, 'g');
    substitutedText = substitutedText.replace(pathRegex, variable.value);
    
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
      // Validate and create URL object *after* substitution
      const url = new URL(substitutedUrl);
      
      // Append any remaining *enabled* params that were not used for substitution, as actual query params.
      request.params
        .filter(p => p.enabled && p.key && !request.url.includes(`:${p.key}`) && !request.url.includes(`{{${p.key}}}`))
        .forEach(p => {
          url.searchParams.append(p.key, p.value);
        });

      substitutedUrl = url.toString();
  } catch (error) {
    // Silently fail, as the URL might be valid after variable substitution in the fetch call.
    // This allows for variables like `{{base_url}}/path`
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
