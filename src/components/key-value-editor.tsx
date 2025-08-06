'use client';

import type { KeyValue } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2 } from 'lucide-react';

interface KeyValueEditorProps {
  items: KeyValue[];
  onChange: (items: KeyValue[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  items,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const handleItemChange = (id: string, field: 'key' | 'value' | 'enabled', value: string | boolean) => {
    const newItems = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const addItem = () => {
    const newItems = [...items, { id: crypto.randomUUID(), key: '', value: '', enabled: true }];
    onChange(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    onChange(newItems);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center text-sm font-medium text-muted-foreground">
        <div></div>
        <div>{keyPlaceholder}</div>
        <div>{valuePlaceholder}</div>
        <div></div>
      </div>
      {items.map(item => (
        <div key={item.id} className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center">
          <Checkbox
            checked={item.enabled}
            onCheckedChange={(checked) => handleItemChange(item.id, 'enabled', !!checked)}
            aria-label="Enable/Disable"
          />
          <Input
            value={item.key}
            onChange={(e) => handleItemChange(item.id, 'key', e.target.value)}
            placeholder={keyPlaceholder}
          />
          <Input
            value={item.value}
            onChange={(e) => handleItemChange(item.id, 'value', e.target.value)}
            placeholder={valuePlaceholder}
          />
          <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} aria-label="Remove item">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-2 h-4 w-4" /> Add
      </Button>
    </div>
  );
}
