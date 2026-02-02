import { createServer } from 'node:http';
import { genSchema } from './schema';
import { createYoga } from 'graphql-yoga';
import plugins from './envelop';

const YOGA_PORT = 4000;

(async () => {
  const schema = await genSchema();

  const yoga = createYoga({
    schema,
    plugins,
    context: ({ request }) => ({ request }),
  });

  const server = createServer(yoga);

  server.listen(YOGA_PORT, () => {
    console.log(`Server is listening at http://localhost:${YOGA_PORT}/graphql`);
  });
})();