
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput } from '../schema';
import { updateCounter } from '../handlers/update_counter';
import { eq } from 'drizzle-orm';

describe('updateCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and increment counter when no counter exists', async () => {
    const input: UpdateCounterInput = { operation: 'increment' };
    
    const result = await updateCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 5 })
      .execute();

    const input: UpdateCounterInput = { operation: 'increment' };
    const result = await updateCounter(input);

    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement counter value', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({ value: 10 })
      .execute();

    const input: UpdateCounterInput = { operation: 'decrement' };
    const result = await updateCounter(input);

    expect(result.value).toEqual(9);
  });

  it('should reset counter value to zero', async () => {
    // Create initial counter with non-zero value
    await db.insert(countersTable)
      .values({ value: 42 })
      .execute();

    const input: UpdateCounterInput = { operation: 'reset' };
    const result = await updateCounter(input);

    expect(result.value).toEqual(0);
  });

  it('should update timestamp when counter is modified', async () => {
    // Create initial counter
    const initialResult = await db.insert(countersTable)
      .values({ value: 0 })
      .returning()
      .execute();
    
    const initialTimestamp = initialResult[0].updated_at;

    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateCounterInput = { operation: 'increment' };
    const result = await updateCounter(input);

    expect(result.updated_at.getTime()).toBeGreaterThan(initialTimestamp.getTime());
  });

  it('should save updated counter to database', async () => {
    const input: UpdateCounterInput = { operation: 'increment' };
    const result = await updateCounter(input);

    // Verify the counter was saved to database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(1);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should handle multiple operations correctly', async () => {
    // Test sequence of operations
    let result = await updateCounter({ operation: 'increment' });
    expect(result.value).toEqual(1);

    result = await updateCounter({ operation: 'increment' });
    expect(result.value).toEqual(2);

    result = await updateCounter({ operation: 'decrement' });
    expect(result.value).toEqual(1);

    result = await updateCounter({ operation: 'reset' });
    expect(result.value).toEqual(0);
  });
});
