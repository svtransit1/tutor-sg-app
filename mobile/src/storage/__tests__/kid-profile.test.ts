import AsyncStorage from '@react-native-async-storage/async-storage';
import { addKid, updateKid, deleteKid, getKids, getKid } from '../kid-profile';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('kid profile storage', () => {
  it('starts with empty list', async () => {
    const kids = await getKids();
    expect(kids).toEqual([]);
  });

  it('adds a kid', async () => {
    const kid = await addKid('Alice', 'P1', 'en');
    expect(kid).not.toBeNull();
    expect(kid!.name).toBe('Alice');
    expect(kid!.level).toBe('P1');
    expect(kid!.language).toBe('en');
    expect(kid!.id).toBeDefined();

    const all = await getKids();
    expect(all).toHaveLength(1);
  });

  it('adds up to 4 kids, then returns null', async () => {
    for (let i = 0; i < 4; i++) {
      const r = await addKid(`Kid${i}`, 'P1', 'en');
      expect(r).not.toBeNull();
    }
    const fifth = await addKid('Kid5', 'P2', 'zh-Hans');
    expect(fifth).toBeNull();
  });

  it('updates a kid', async () => {
    const kid = await addKid('Bob', 'P3', 'en');
    expect(kid).not.toBeNull();
    const updated = await updateKid(kid!.id, { name: 'Bobby', level: 'P4' });
    expect(updated).not.toBeNull();
    expect(updated!.name).toBe('Bobby');
    expect(updated!.level).toBe('P4');
    expect(updated!.language).toBe('en');
  });

  it('deletes a kid', async () => {
    const kid = await addKid('Charlie', 'P2', 'zh-Hans');
    expect(kid).not.toBeNull();
    const ok = await deleteKid(kid!.id);
    expect(ok).toBe(true);
    const all = await getKids();
    expect(all).toHaveLength(0);
  });

  it('getKid returns correct kid by id', async () => {
    const kid = await addKid('Dana', 'P5', 'en');
    expect(kid).not.toBeNull();
    const found = await getKid(kid!.id);
    expect(found).not.toBeNull();
    expect(found!.name).toBe('Dana');
    const notFound = await getKid('nonexistent');
    expect(notFound).toBeNull();
  });
});
