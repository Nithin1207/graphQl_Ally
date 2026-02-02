import type { Plugin } from '@envelop/core';
import { randomUUID } from 'crypto';
import { ContextType } from '../types';


export const buildHeaders = (): Plugin<ContextType> => ({
  onContextBuilding({ context, extendContext }) {
    // I used this because it's creates unique 'requestId', even if we have 1,000 users hitting the API at once 
    // I didn't use standard ES6
    const requestId = randomUUID();

    const clientHeader = context.request?.headers?.get('client') || '';

    extendContext({
      requestId,
      clientHeader,
    });
  },
});




