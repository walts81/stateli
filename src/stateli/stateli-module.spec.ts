import { StateliModule } from './stateli-module';

const noTypeMsg = ' must have a type defined';
const typeSlashMsg = ' type cannot contain a forward slash "/"';

const getNoTypeMsg = (type: string) => `${type}${noTypeMsg}`;
const getTypeSlashMsg = (type: string) => `${type}${typeSlashMsg}`;

describe('StateliModule', () => {
  test('should throw error when invalid ctor parameters', () => {
    expect(() => {
      const sm: any = StateliModule;
      new sm('mod');
    }).toThrowError('Invalid constructor arguments');
  });
  describe('getters', () => {
    test('should default to empty array when null', () => {
      const m = new StateliModule({
        name: '',
        namespaced: false,
        getters: null as any,
        actions: [],
        mutations: [],
        state: { val: '' },
      });
      expect(m.getters).toStrictEqual([]);
    });
    test('should throw error when no type defined', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addGetter({ type: '', getValue: x => x.val });
      }).toThrowError(getNoTypeMsg('GETTER'));
    });
    test('should throw error when type contains forward slash', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addGetter({ type: 'mod/getter', getValue: x => x.val });
      }).toThrowError(getTypeSlashMsg('GETTER'));
    });
  });
  describe('actions', () => {
    test('should default to empty array when null', () => {
      const m = new StateliModule({
        name: '',
        namespaced: false,
        getters: [],
        actions: null as any,
        mutations: [],
        state: { val: '' },
      });
      expect(m.actions).toStrictEqual([]);
    });
    test('should throw error when no type defined', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addAction({ type: '', execute: () => Promise.resolve() });
      }).toThrowError(getNoTypeMsg('ACTION'));
    });
    test('should throw error when type contains forward slash', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addAction({ type: 'mod/action', execute: () => Promise.resolve() });
      }).toThrowError(getTypeSlashMsg('ACTION'));
    });
  });
  describe('mutations', () => {
    test('should default to empty array when null', () => {
      const m = new StateliModule({
        name: '',
        namespaced: false,
        getters: [],
        actions: [],
        mutations: null as any,
        state: { val: '' },
      });
      expect(m.mutations).toStrictEqual([]);
    });
    test('should throw error when no type defined', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addMutation({ type: '', commit: x => x });
      }).toThrowError(getNoTypeMsg('MUTATION'));
    });
    test('should throw error when type contains forward slash', () => {
      expect(() => {
        const m = new StateliModule('mod', false, { val: '' });
        m.addMutation({ type: 'mod/mutation', commit: x => x });
      }).toThrowError(getTypeSlashMsg('MUTATION'));
    });
  });
});
