export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValue {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiRequest {
  id: string;
  url: string;
  method: HttpMethod;
  headers: KeyValue[];
  params: KeyValue[];
  body: string;
  name?: string;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: any;
  time: number;
  size: number;
}

export interface HistoryItem {
  id: string;
  request: ApiRequest;
  response: ApiResponse | null;
  timestamp: number;
}

export interface Variable extends KeyValue {}

// Schema for Test Collection Import
export interface Assertion {
    type: 'equals' | 'contains' | 'exists' | 'not_exists';
    path: string; // JSONPath
    expected?: any;
}

export interface TestCase {
    name: string;
    method: HttpMethod;
    endpoint: string;
    headers?: Record<string, string | number | boolean>;
    query_params?: Record<string, string | number | boolean>;
    body?: any | null;
    expected_status: number;
    expected_response?: any;
    assertions?: Assertion[];
}

export interface TestCollection {
    collection_name: string;
    description?: string;
    base_url?: string;
    tests: TestCase[];
}
