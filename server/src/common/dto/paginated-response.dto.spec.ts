import { clampPage, totalPagesFor } from './paginated-response.dto.js';

describe('totalPagesFor', () => {
  it('reports a single page when there are no results', () => {
    expect(totalPagesFor(0, 5)).toBe(1);
  });

  it('rounds a partial page up', () => {
    expect(totalPagesFor(6, 5)).toBe(2);
  });

  it('does not add a page for an exact multiple', () => {
    expect(totalPagesFor(10, 5)).toBe(2);
  });

  it('reports one page when the results fit within it', () => {
    expect(totalPagesFor(3, 5)).toBe(1);
  });
});

describe('clampPage', () => {
  it('raises a page below the first one', () => {
    expect(clampPage(0, 4)).toBe(1);
  });

  it('raises a negative page to the first one', () => {
    expect(clampPage(-7, 4)).toBe(1);
  });

  it('lowers a page beyond the last one', () => {
    expect(clampPage(99, 4)).toBe(4);
  });

  it('leaves a page inside the range untouched', () => {
    expect(clampPage(2, 4)).toBe(2);
  });
});
