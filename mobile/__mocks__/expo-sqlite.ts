export class SQLiteDatabase {
  execAsync = jest.fn().mockResolvedValue(undefined);
  runAsync = jest.fn().mockResolvedValue({lastInsertRowId:0,changes:0});
  getAllAsync = jest.fn().mockResolvedValue([]);
  getFirstAsync = jest.fn().mockResolvedValue(null);
  onDatabaseChange = jest.fn();
}
export async function openDatabaseAsync(n: string) { return new SQLiteDatabase(); }
export function openDatabaseSync(n: string) { return new SQLiteDatabase(); }
