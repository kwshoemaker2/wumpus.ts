import { expect } from 'chai';

describe('calculate', function() {
  it('add', function() {
    let result = 5 + 2;
    expect(result).equal(7);
  });

  it('substract', function() {
    let result = 5 - 2;
    expect(result).equal(3);
  });
});