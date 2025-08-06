'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Settings, Plus, Trash2 } from 'lucide-react';
import type { Variable } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';

interface VariableManagerProps {
  variables: Variable[];
  onVariablesChange: (variables: Variable[]) => void;
}

export function VariableManager({ variables, onVariablesChange }: VariableManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localVariables, setLocalVariables] = useState<Variable[]>(variables);

  const handleSave = () => {
    onVariablesChange(localVariables);
    setIsOpen(false);
  };

  const handleItemChange = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newItems = localVariables.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setLocalVariables(newItems);
  };

  const addItem = () => {
    const newItems = [...localVariables, { id: crypto.randomUUID(), key: '', value: '', enabled: true }];
    setLocalVariables(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = localVariables.filter(item => item.id !== id);
    setLocalVariables(newItems);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (open) setLocalVariables(variables);
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Manage Variables</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Global Variables</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <ScrollArea className="h-72">
            <div className="pr-6 space-y-2">
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center text-sm font-medium text-muted-foreground">
                <div></div>
                <div>Variable Key</div>
                <div>Variable Value</div>
                <div></div>
              </div>
              {localVariables.map(item => (
                <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
                  <Checkbox
                    checked={item.enabled}
                    onCheckedChange={(checked) => handleItemChange(item.id, 'enabled', !!checked)}
                    aria-label="Enable/Disable variable"
                  />
                  <Input
                    value={item.key}
                    onChange={(e) => handleItemChange(item.id, 'key', e.target.value)}
                    placeholder="Key"
                  />
                  <Input
                    value={item.value}
                    onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
                    placeholder="Value"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove variable">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
           <Button variant="outline" size="sm" onClick={addItem} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Add Variable
            </Button>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
