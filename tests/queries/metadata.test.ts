import { parse } from 'graphql';
import { executorPromise } from '../exectuor';

describe('Response Metadata', () => {
    let executor: any;

    beforeAll(async () => {
        executor = await executorPromise;
    });

    describe('When a client makes a query request', () => {
        test('the response includes a unique tracking identifier', async () => {
            // Prepare a query to fetch user address
            const query = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
          }
        }
      `;

            // Execute the query with proper headers
            const response: any = await executor({
                document: parse(query),
                variables: { username: 'jack' },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            // Response metadata exists with valid UUID
            expect(response).toHaveProperty('metadata');
            expect(response.metadata).toHaveProperty('requestId');
            expect(typeof response.metadata.requestId).toBe('string');
            expect(response.metadata.requestId).toMatch(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
            );
        });
    });

    describe('When a client makes a mutation request', () => {
        test('the response also includes a unique tracking identifier', async () => {
            // Prepare a mutation to create new address
            const mutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
          }
        }
      `;

            const uniqueUsername = `test_metadata_${Date.now()}`;

            // Execute the mutation with proper headers
            const response: any = await executor({
                document: parse(mutation),
                variables: {
                    username: uniqueUsername,
                    address: {
                        street: '123 Metadata St',
                        city: 'MetaCity',
                        state: 'MC',
                        zipcode: '00000'
                    }
                },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            // Mutation response includes metadata
            expect(response).toHaveProperty('metadata');
            expect(response.metadata).toHaveProperty('requestId');
            expect(typeof response.metadata.requestId).toBe('string');
        });
    });

    describe('When multiple requests are made', () => {
        test('each request receives its own unique identifier', async () => {
            // Prepare identical queries to execute twice
            const query = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
          }
        }
      `;

            // Execute the same query twice (just to check)
            const firstResponse: any = await executor({
                document: parse(query),
                variables: { username: 'jack' },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            const secondResponse: any = await executor({
                document: parse(query),
                variables: { username: 'jack' },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            // Each response has a different request ID
            expect(firstResponse.metadata).toBeDefined();
            expect(firstResponse.metadata.requestId).toBeDefined();
            expect(secondResponse.metadata).toBeDefined();
            expect(secondResponse.metadata.requestId).toBeDefined();
            expect(firstResponse.metadata.requestId).not.toBe(
                secondResponse.metadata.requestId
            );
        });
    });
});