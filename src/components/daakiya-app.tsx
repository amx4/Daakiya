'use client';

import React, { useState, useReducer, useEffect } from 'react';
import type { ApiRequest, ApiResponse, HistoryItem, HttpMethod, Variable, KeyValue } from '@/lib/types';
import { executeRequest } from '@/lib/actions';
import { RequestPanel } from '@/components/request-panel';
import { ResponsePanel } from '@/components/response-panel';
import { Button } from '@/components/ui/button';
import { DaakiyaLogo } from '@/components/icons';
import { VariableManager } from './variable-manager';
import { useToast } from '@/hooks/use-toast';
import { History, Trash2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

const initialRequest: ApiRequest = {
  id: crypto.randomUUID(),
  method: 'GET',
  url: '',
  params: [],
  headers: [],
  body: '',
};

type State = {
  history: HistoryItem[];
  variables: Variable[];
  activeRequest: ApiRequest;
  activeResponse: ApiResponse | null;
  isLoading: boolean;
  isAutoSaveEnabled: boolean;
};

type Action =
  | { type: 'SET_REQUEST'; payload: ApiRequest }
  | { type: 'SET_RESPONSE'; payload: ApiResponse | null }
  | { type: 'START_LOADING' }
  | { type: 'STOP_LOADING' }
  | { type: 'ADD_TO_HISTORY'; payload: HistoryItem }
  | { type: 'SET_VARIABLES'; payload: Variable[] }
  | { type: 'LOAD_FROM_HISTORY'; payload: HistoryItem }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'TOGGLE_AUTOSAVE' };

function daakiyaReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_REQUEST':
      return { ...state, activeRequest: action.payload };
    case 'SET_RESPONSE':
      return { ...state, activeResponse: action.payload };
    case 'START_LOADING':
      return { ...state, isLoading: true };
    case 'STOP_LOADING':
      return { ...state, isLoading: false };
    case 'ADD_TO_HISTORY':
        const newHistory = [action.payload, ...state.history].slice(0, 50);
        return { ...state, history: newHistory };
    case 'SET_VARIABLES':
      return { ...state, variables: action.payload };
    case 'LOAD_FROM_HISTORY':
        return { ...state, activeRequest: action.payload.request, activeResponse: action.payload.response };
    case 'CLEAR_HISTORY':
        return { ...state, history: [] };
    case 'TOGGLE_AUTOSAVE':
        return { ...state, isAutoSaveEnabled: !state.isAutoSaveEnabled };
    default:
      return state;
  }
}

const initialState: State = {
  history: [],
  variables: [],
  activeRequest: initialRequest,
  activeResponse: null,
  isLoading: false,
  isAutoSaveEnabled: true,
};

export default function DaakiyaApp() {
  const [state, dispatch] = useReducer(daakiyaReducer, initialState);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('daakiyaState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.history) dispatch({ type: 'ADD_TO_HISTORY', payload: parsed.history[0] }); // A bit of a hack to fill history
        if (parsed.variables) dispatch({ type: 'SET_VARIABLES', payload: parsed.variables });
        if (parsed.isAutoSaveEnabled !== undefined) {
            if (!parsed.isAutoSaveEnabled) dispatch({ type: 'TOGGLE_AUTOSAVE' });
        }
      }
    } catch (e) {
      console.error("Could not load state from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      const stateToSave = {
        history: state.history,
        variables: state.variables,
        isAutoSaveEnabled: state.isAutoSaveEnabled,
      };
      localStorage.setItem('daakiyaState', JSON.stringify(stateToSave));
    } catch (e) {
        console.error("Could not save state to localStorage", e);
    }
  }, [state.history, state.variables, state.isAutoSaveEnabled]);


  const handleSendRequest = async () => {
    dispatch({ type: 'START_LOADING' });
    dispatch({ type: 'SET_RESPONSE', payload: null });
    
    // Add params to URL
    const url = new URL(state.activeRequest.url);
    state.activeRequest.params.forEach(p => {
        if (p.enabled && p.key) {
            url.searchParams.append(p.key, p.value);
        }
    });

    const requestToSend = { ...state.activeRequest, url: url.toString() };

    const response = await executeRequest(requestToSend, state.variables);
    
    dispatch({ type: 'SET_RESPONSE', payload: response });
    dispatch({ type: 'STOP_LOADING' });

    if(state.isAutoSaveEnabled) {
        const historyItem: HistoryItem = {
            id: crypto.randomUUID(),
            request: state.activeRequest,
            response,
            timestamp: Date.now(),
        };
        dispatch({ type: 'ADD_TO_HISTORY', payload: historyItem });
    }
  };

  const handleRequestChange = (request: ApiRequest) => {
    dispatch({ type: 'SET_REQUEST', payload: request });
  };
  
  const handleSetVariables = (variables: Variable[]) => {
      dispatch({ type: 'SET_VARIABLES', payload: variables });
      toast({ title: "Variables saved." });
  }

  const handleClearHistory = () => {
      dispatch({ type: 'CLEAR_HISTORY' });
      toast({ title: "History cleared." });
  }

  const handleNewRequest = () => {
      dispatch({ type: 'SET_REQUEST', payload: { ...initialRequest, id: crypto.randomUUID() } });
      dispatch({ type: 'SET_RESPONSE', payload: null });
  }

  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-80 flex flex-col border-r">
        <header className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
                <DaakiyaLogo className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Daakiya Pro</h1>
            </div>
            <VariableManager variables={state.variables} onVariablesChange={handleSetVariables} />
        </header>
        <div className="p-4 flex-grow flex flex-col min-h-0">
            <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold flex items-center gap-2"><History className="w-4 h-4"/> History</h2>
                <Button variant="ghost" size="icon" onClick={handleClearHistory}><Trash2 className="w-4 h-4"/></Button>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <Switch 
                    id="autosave-switch"
                    checked={state.isAutoSaveEnabled}
                    onCheckedChange={() => dispatch({ type: 'TOGGLE_AUTOSAVE' })}
                />
                <Label htmlFor="autosave-switch">Auto-save</Label>
            </div>
            <ScrollArea className="flex-grow">
                 {state.history.length === 0 ? (
                    <div className="text-center text-sm text-muted-foreground pt-10">No history yet.</div>
                ) : (
                <div className="space-y-2 pr-4">
                    {state.history.map(item => (
                        <Card key={item.id} className="cursor-pointer hover:bg-muted" onClick={() => dispatch({ type: 'LOAD_FROM_HISTORY', payload: item })}>
                            <CardContent className="p-3">
                                <div className="font-semibold truncate">{item.request.method} {item.request.url || 'Untitled Request'}</div>
                                <div className="text-sm text-muted-foreground">{new Date(item.timestamp).toLocaleString()}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                )}
            </ScrollArea>
             <div className="pt-4 border-t">
                <Button onClick={handleNewRequest} className="w-full">
                    New Request
                </Button>
            </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        <RequestPanel
          request={state.activeRequest}
          onSend={handleSendRequest}
          onRequestChange={handleRequestChange}
          isLoading={state.isLoading}
        />
        <ResponsePanel response={state.activeResponse} isLoading={state.isLoading} />
      </main>
    </div>
  );
}
