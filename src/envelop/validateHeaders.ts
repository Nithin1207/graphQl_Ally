import type { Plugin } from '@envelop/core';
import { GraphQLError } from 'graphql';
import { ContextType } from '../types';


//this code Checks the already extracted header directly for faster validation.

export const validateHeaders = (): Plugin<ContextType> => ({
    onContextBuilding({ context }) {
        // Check if client header exists
        if (!context.clientHeader) {
            throw new GraphQLError('Missing required "client" header', {
                extensions: {
                    code: 'MISSING_HEADER',
                },
            });
        }
    },
});