import { render } from '@testing-library/react';
import Login from '../renderer/login/login';

describe('App', () => {
  it('should render', () => {
    expect(render(<Login />)).toBeTruthy();
  });
});
