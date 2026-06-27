import React from 'react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';

import Page from '../src/app/page';

const messages = { Hello: 'Hello' };

describe('Page', () => {
  it('should render successfully', () => {
    const { baseElement } = render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <Page />
      </NextIntlClientProvider>
    );
    expect(baseElement).toBeTruthy();
  });
});
