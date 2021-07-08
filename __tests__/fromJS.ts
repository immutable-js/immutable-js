import { runInNewContext } from 'vm';

import { isCollection, fromJS } from 'immutable';

describe('fromJS', () => {
  it('is iterable outside of a vm', () => {
    expect(isCollection(fromJS({}))).toBe(true);
  });

  it('is iterable inside of a vm', () => {
    runInNewContext(
      `
    expect(isCollection(fromJS({}))).toBe(true);
  `,
      {
        expect,
        isCollection,
        fromJS,
      },
      {}
    );
  });
});
