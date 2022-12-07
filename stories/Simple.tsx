import React from 'react';

import { App } from './App';

export const Simple: React.FC<Record<string, unknown>> = (props) => {
  return (
    <App
      {...props}
    />
  );
};
