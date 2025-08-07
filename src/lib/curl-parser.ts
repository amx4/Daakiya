import type { ApiRequest, HttpMethod, KeyValue } from './types';

function unquote(str: string): string {
    if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
        return str.slice(1, -1);
    }
    return str;
}

export function parseCurl(curlCommand: string): Omit<ApiRequest, 'id' | 'name'> {
    const cleanedCommand = curlCommand.replace(/\\\s*\n\s*/g, ' ').trim();
    
    let url = '';
    let method: HttpMethod = 'GET';
    const headers: KeyValue[] = [];
    let body = '';

    // Simplified parsing logic
    const urlMatch = cleanedCommand.match(/^(?:curl\s+)?(?:'|")?(https?:\/\/[^'"]+)(?:'|")?/);
    if (urlMatch) {
        url = urlMatch[1];
    }
    
    const methodMatch = cleanedCommand.match(/-(?:-request|-X)\s+([A-Z]+)/);
    if (methodMatch) {
        method = methodMatch[1].toUpperCase() as HttpMethod;
    }

    const headerRegex = /-(?:-header|-H)\s+'([^']+)'/g;
    let match;
    while ((match = headerRegex.exec(cleanedCommand)) !== null) {
        const [key, ...valueParts] = match[1].split(/:\s*/);
        if (key) {
            headers.push({
                id: crypto.randomUUID(),
                key: key.trim(),
                value: valueParts.join(': ').trim(),
                enabled: true,
            });
        }
    }
    
    const dataMatch = cleanedCommand.match(/-(?:-data|-d|--data-raw)\s+'([\s\S]*)'/);
    if (dataMatch && dataMatch[1]) {
        body = dataMatch[1].trim();
        if(!methodMatch) { // if -X is not specified, it's a POST
            method = 'POST';
        }
    } else {
        const dataMatchUnquoted = cleanedCommand.match(/-(?:-data|-d|--data-raw)\s+([\s\S]*)/);
        if(dataMatchUnquoted && dataMatchUnquoted[1] && !dataMatchUnquoted[1].includes('-H')) {
             body = dataMatchUnquoted[1].trim();
             if(!methodMatch) {
                method = 'POST';
             }
        }
    }

    // A simple heuristic to find URL if it's not at the start
    if (!url) {
        const tokens = cleanedCommand.split(/\s+/);
        const urlToken = tokens.find(t => t.startsWith('http') || (t.startsWith('"http') || t.startsWith("'http")));
        if (urlToken) {
            url = unquote(urlToken);
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
