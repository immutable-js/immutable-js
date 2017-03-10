import * as jasmineCheck from 'jasmine-check';
import { List, Range, Seq } from '../';
jasmineCheck.install();

describe('find', () => {
  it('find returns notSetValue when match is not found', () => {
    expect(Seq.of(1, 2, 3, 4, 5, 6).find(() => false, null, 9)).toEqual(9);
  });

  it('findEntry returns notSetValue when match is not found', () => {
    expect(Seq.of(1, 2, 3, 4, 5, 6).findEntry(() => false, null, 9)).toEqual(9);
  });

  it('findLastEntry returns notSetValue when match is not found', () => {
    expect(Seq.of(1, 2, 3, 4, 5, 6).findLastEntry(() => false, null, 9)).toEqual(9);
  });
});
