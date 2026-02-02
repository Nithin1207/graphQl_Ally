import { createYoga } from 'graphql-yoga';
import { buildHTTPExecutor } from '@graphql-tools/executor-http';
import { genSchema } from '../src/schema';
import { GraphQLError } from 'graphql';
import plugins from '../src/envelop/index';


// Includes all plugins: validation, logging, metadata enrichment
//i use 'await genSchema' here  to ensure the schema is fully built before testing and  
// I also added a header check here so tests fail early if the required client ID is missing.



console.profile = jest.fn();

const createExecutor = async () => {
  const schema = await genSchema();

  const yoga = createYoga({
    schema,
    plugins, // Uses all plugins including addResponseMetadata
    context: ({ request }: any) => {
      const clientHeader = request.headers.get('client');

      // it check's to catch missing headers during the testing
      if (!clientHeader) {
        throw new GraphQLError('Missing required "client" header', {
          extensions: { code: 'MISSING_HEADER' }
        });
      }


      return {
        clientHeader,
      };
    },
  });

  return buildHTTPExecutor({
    fetch: yoga.fetch,
  });
};

export const executorPromise = createExecutor();
export const executor = executorPromise;