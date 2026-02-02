import type { Plugin } from '@envelop/core';
import type { ExecutionResult } from 'graphql';
import { ContextType } from '../types';



// I used 'unknown' for strict type safety and a custom "metadata field" used to track specific data

function isValidExecutionResult(value: unknown): value is ExecutionResult {
    return (
        value !== null &&
        typeof value === 'object' &&
        ('data' in value || 'errors' in value)
    );
}

export const addResponseMetadata = (): Plugin<ContextType> => {
    return {
        onExecute({ args }) {
            return {
                onExecuteDone({ result }) {
                    const { contextValue } = args;
                    const requestId = contextValue?.requestId;

                    // Early return if no requestId available
                    if (!requestId) {
                        return;
                    }

                    const enrichWithMetadata = (resultObj: unknown): void => {
                        if (!isValidExecutionResult(resultObj)) {
                            return;
                        }

                        const execResult = resultObj as any;
                        execResult.metadata = {
                            ...(execResult.metadata || {}),
                            requestId,
                        };
                    };

                    if (Array.isArray(result)) {
                        result.forEach(enrichWithMetadata);
                        return;
                    }
                    enrichWithMetadata(result);
                },
            };
        },
    };
};