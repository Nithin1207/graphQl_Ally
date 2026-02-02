import type { Logger } from '../logger';


// no extra checks needed( i used strict types)
// I guarantee that by the time we reach a resolver, these values exist


export type ContextType = {

  requestId: string;
  clientHeader: string;
  logger: Logger;
  request?: Request;

  // i just added for more HTTP headers, if we want in future
  headers?: {
    [key: string]: string | undefined;
  };
};