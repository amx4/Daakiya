import type { ApiRequest, HttpMethod, KeyValue } from './types';

function unquote(str: string): string {
    if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
        return str.slice(1, -1);
    }
    return str;
}

export function parseCurl(curlCommand: string): Omit<ApiRequest, 'id' | 'name'> {
    const cleanedCommand = curlCommand.replace(/\\s*\\\s*$/gm, ' ').replace(/\s\s+/g, ' ').trim();
    const tokens = cleanedCommand.split(/\s+/);
    
    let url = '';
    let method: HttpMethod = 'GET';
    const headers: KeyValue[] = [];
    let body = '';
    let dataFlag = false;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (token.toLowerCase() === 'curl' && !url) {
            // Find the URL, which is typically the first argument not starting with -
            let j = i + 1;
            while(j < tokens.length && tokens[j].startsWith('-')) {
                // Skip over flags to find the URL
                j += 2; // Assuming flags have arguments
            }
             if (j < tokens.length) {
                url = unquote(tokens[j]);
                i=j; // continue parsing from after the URL
            }
            continue;
        }

        if (token === '--request' || token === '-X') {
            method = tokens[++i].toUpperCase() as HttpMethod;
        } else if (token === '--header' || token === '-H') {
            const headerStr = unquote(tokens[++i]);
            const [key, ...valueParts] = headerStr.split(/:\s*/);
            if (key) {
                headers.push({
                    id: crypto.randomUUID(),
                    key: key,
                    value: valueParts.join(': '),
                    enabled: true,
                });
            }
        } else if (token === '--data' || token === '-d' || token === '--data-raw') {
            body = unquote(tokens[++i]);
            method = 'POST'; // Typically requests with data are POST
        } else if (token.startsWith('http') && !url) {
             url = unquote(token);
        }
    }
    
    if (!url) {
        // Fallback for url if it's the last argument.
        const lastToken = tokens[tokens.length -1];
        if (lastToken.startsWith('http')) {
            url = unquote(lastToken);
        }
    }


    return {
        url,
        method,
        headers,
        params: [], // cURL parsing for params is complex, omitting for now
        body,
    };
}
