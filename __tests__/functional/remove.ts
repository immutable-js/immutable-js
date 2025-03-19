import { remove, List, Map } from 'immutable';

describe('remove', () => {
  it('for immutable structure', () => {
    expect(remove(List(['dog', 'frog', 'cat']), 1)).toEqual(
      List(['dog', 'cat'])
    );
    expect(remove(Map({ x: 123, y: 456 }), 'x')).toEqual(Map({ y: 456 }));
  });

  it('for Array', () => {
    expect(remove(['dog', 'frog', 'cat'], 1)).toEqual(['dog', 'cat']);
  });

  it('for plain objects', () => {
    expect(remove({ x: 123, y: 456 }, 'x')).toEqual({ y: 456 });
  });
});
