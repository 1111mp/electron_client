import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Root from '../renderer/login/root';

describe('App', () => {
  it('should render', () => {
    expect(render(<Root />)).toBeTruthy();
  });
});
