import { MaxTransLitePage } from './app.po';

describe('max-trans-lite App', function() {
  let page: MaxTransLitePage;

  beforeEach(() => {
    page = new MaxTransLitePage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
