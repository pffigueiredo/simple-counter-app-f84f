
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function updateCounter(input: UpdateCounterInput): Promise<Counter> {
  try {
    // First, ensure we have a counter record (create if doesn't exist)
    let counter = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (counter.length === 0) {
      // Create initial counter with value 0
      const result = await db.insert(countersTable)
        .values({ value: 0 })
        .returning()
        .execute();
      counter = result;
    }

    const currentCounter = counter[0];
    let newValue: number;

    // Calculate new value based on operation
    switch (input.operation) {
      case 'increment':
        newValue = currentCounter.value + 1;
        break;
      case 'decrement':
        newValue = currentCounter.value - 1;
        break;
      case 'reset':
        newValue = 0;
        break;
    }

    // Update the counter with new value and timestamp
    const updatedResult = await db.update(countersTable)
      .set({ 
        value: newValue,
        updated_at: sql`NOW()` // Use SQL NOW() for accurate server timestamp
      })
      .where(eq(countersTable.id, currentCounter.id))
      .returning()
      .execute();

    return updatedResult[0];
  } catch (error) {
    console.error('Counter update failed:', error);
    throw error;
  }
}
