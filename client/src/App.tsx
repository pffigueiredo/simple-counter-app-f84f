
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { Counter } from '../../server/src/schema';

function App() {
  const [counter, setCounter] = useState<Counter | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadCounter = useCallback(async () => {
    try {
      const result = await trpc.getCounter.query();
      setCounter(result);
    } catch (error) {
      console.error('Failed to load counter:', error);
    }
  }, []);

  useEffect(() => {
    loadCounter();
  }, [loadCounter]);

  const handleOperation = async (operation: 'increment' | 'decrement' | 'reset') => {
    setIsLoading(true);
    try {
      const updatedCounter = await trpc.updateCounter.mutate({ operation });
      setCounter(updatedCounter);
    } catch (error) {
      console.error('Failed to update counter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!counter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading counter...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-sm border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold mb-4">Counter</h1>
          <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
            {counter.value}
          </div>
          <p className="text-sm text-gray-500">
            Last updated: {counter.updated_at.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex gap-3 justify-center">
          <Button
            onClick={() => handleOperation('decrement')}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="px-6"
          >
            Decrement
          </Button>
          <Button
            onClick={() => handleOperation('reset')}
            disabled={isLoading}
            variant="outline"
            size="lg"
            className="px-6"
          >
            Reset
          </Button>
          <Button
            onClick={() => handleOperation('increment')}
            disabled={isLoading}
            size="lg"
            className="px-6"
          >
            Increment
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
