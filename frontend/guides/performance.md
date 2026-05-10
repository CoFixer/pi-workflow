# Performance Optimization

Patterns for optimizing React component performance, preventing unnecessary re-renders, and avoiding memory leaks.

---

## useMemo for Expensive Computations

### When to Use

Use `useMemo` for:
- Filtering/sorting large arrays
- Complex calculations
- Derived data that doesn't need recalculation on every render

```typescript
import { useMemo } from 'react';

interface DataDisplayProps {
  items: Item[];
  searchTerm: string;
}

export default function DataDisplay({ items, searchTerm }: DataDisplayProps) {
  // ❌ AVOID - Runs on every render
  const filteredItems = items
    .filter((item) => item.name.includes(searchTerm))
    .sort((a, b) => a.name.localeCompare(b.name));

  // ✅ CORRECT - Only recalculates when dependencies change
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [items, searchTerm]);

  return <List items={filteredItems} />;
}
```

---

## useCallback for Event Handlers

### When to Use

Use `useCallback` for:
- Event handlers passed to child components
- Functions used in dependency arrays
- Callbacks passed to memoized components

```typescript
import { useCallback, useState } from 'react';

interface ParentProps {
  onSave: () => void;
}

export default function Parent({ onSave }: ParentProps) {
  const [items, setItems] = useState<Item[]>([]);

  // ❌ AVOID - Creates new function on every render
  const handleSelect = (id: string) => {
    console.log('Selected:', id);
  };

  // ✅ CORRECT - Stable function reference
  const handleSelect = useCallback((id: string) => {
    console.log('Selected:', id);
  }, []);

  // ✅ CORRECT - With dependencies
  const handleSave = useCallback(() => {
    saveItems(items);
    onSave();
  }, [items, onSave]);

  return <Child items={items} onSelect={handleSelect} />;
}
```

---

## React.memo for Expensive Components

### When to Use

Use `React.memo` for:
- Components that render often with same props
- Pure presentational components
- List item components

```typescript
import { memo } from 'react';

interface ItemCardProps {
  item: Item;
  onSelect: (id: string) => void;
}

// Memoized component - only re-renders if props change
export const ItemCard = memo(function ItemCard({ item, onSelect }: ItemCardProps) {
  return (
    <div onClick={() => onSelect(item.id)}>
      <h3>{item.name}</h3>
      <p>{item.description}</p>
    </div>
  );
});

// Usage - parent must use useCallback for onSelect!
function Parent() {
  const handleSelect = useCallback((id: string) => {
    // ...
  }, []);

  return items.map((item) => (
    <ItemCard key={item.id} item={item} onSelect={handleSelect} />
  ));
}
```

---

## Lazy Loading

### Code Splitting with React.lazy

```typescript
import { lazy, Suspense } from 'react';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const DataTable = lazy(() => import('./DataTable'));
const RichTextEditor = lazy(() => import('./RichTextEditor'));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<div>Loading chart...</div>}>
        <HeavyChart data={chartData} />
      </Suspense>

      <Suspense fallback={<div>Loading table...</div>}>
        <DataTable items={items} />
      </Suspense>
    </div>
  );
}
```

### When to Lazy Load

- Route-level components
- Heavy components (charts, data grids, editors)
- Components with large dependencies
- Below-the-fold content
- Modal/dialog content

---

## List Optimization

### Key Prop Best Practices

```typescript
// ✅ CORRECT - Stable unique key
{items.map((item) => (
  <ItemCard key={item.id} item={item} />
))}

// ❌ AVOID - Index as key (causes issues with reordering)
{items.map((item, index) => (
  <ItemCard key={index} item={item} />
))}

// ❌ AVOID - Random key (forces re-render)
{items.map((item) => (
  <ItemCard key={Math.random()} item={item} />
))}
```

### Virtualization for Long Lists

For lists with hundreds of items, consider virtualization libraries:
- `@tanstack/react-virtual`
- `react-window`

---

## Debouncing

### Search Input Debouncing

```typescript
import { useState, useMemo, useEffect } from 'react';

export default function SearchInput({ onSearch }: { onSearch: (term: string) => void }) {
  const [value, setValue] = useState('');

  // Debounce the search callback
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## Memory Leak Prevention

### Cleanup in useEffect

```typescript
import { useEffect, useState } from 'react';

export default function DataFetcher({ id }: { id: number }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const result = await api.getData(id);
      // Only update state if component is still mounted
      if (isMounted) {
        setData(result);
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id]);

  return <div>{data}</div>;
}
```

### AbortController for Fetch

```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/data/${id}`, {
        signal: controller.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name !== 'AbortError') {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => controller.abort();
}, [id]);
```

---

## State Optimization

### Avoid Unnecessary State

```typescript
// ❌ AVOID - Derived state as state
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter((item) => item.active));
}, [items]);

// ✅ CORRECT - Derive from existing state
const filteredItems = useMemo(
  () => items.filter((item) => item.active),
  [items]
);
```

### Colocate State

Keep state as close to where it's used as possible:

```typescript
// ❌ AVOID - State in parent when only child needs it
function Parent() {
  const [isOpen, setIsOpen] = useState(false);
  return <Child isOpen={isOpen} setIsOpen={setIsOpen} />;
}

// ✅ CORRECT - State in child that uses it
function Child() {
  const [isOpen, setIsOpen] = useState(false);
  return <Modal open={isOpen} onClose={() => setIsOpen(false)} />;
}
```

---

## Summary

**Performance Checklist:**

- ✅ Use `useMemo` for expensive computations
- ✅ Use `useCallback` for handlers passed to children
- ✅ Use `React.memo` for pure components
- ✅ Use `React.lazy` for code splitting
- ✅ Use stable keys in lists (not indexes)
- ✅ Debounce search inputs (300-500ms)
- ✅ Clean up subscriptions in useEffect
- ✅ Derive state instead of syncing state
- ✅ Colocate state close to usage

**See Also:**

- [component-patterns.md](component-patterns.md) - Component structure
- [complete-examples.md](complete-examples.md) - Full examples
