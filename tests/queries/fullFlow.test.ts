import { parse } from 'graphql';
import { executorPromise } from '../exectuor';

describe('End-to-End User Journey', () => {
    let executor: any;

    beforeAll(async () => {
        executor = await executorPromise;
    });

    describe('When a new user interacts with the address system', () => {
        test('supports complete lifecycle from lookup to creation to duplication prevention', async () => {
            // Create a unique test user with timestamp
            const newUser = `test_flow_${Date.now()}`;

            const addressQuery = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
          }
        }
      `;

            const createMutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
            city
            state
            zipcode
          }
        }
      `;

            // Verify user has no address initially
            const initialLookup: any = await executor({
                document: parse(addressQuery),
                variables: { username: newUser },
                extensions: {
                    headers: { client: 'integration-test' }
                }
            });

            expect(initialLookup.errors).toBeDefined();
            expect(initialLookup.errors[0].message).toContain('does not have an address on file');

            //   Create address for the user
            const createResponse: any = await executor({
                document: parse(createMutation),
                variables: {
                    username: newUser,
                    address: {
                        street: '100 Integration St',
                        city: 'TestCity',
                        state: 'TS',
                        zipcode: '12345'
                    }
                },
                extensions: {
                    headers: { client: 'integration-test' }
                }
            });

            expect(createResponse.data.createAddress).toBeDefined();
            expect(createResponse.data.createAddress).toEqual({
                street: '100 Integration St',
                city: 'TestCity',
                state: 'TS',
                zipcode: '12345'
            });
            expect(createResponse.metadata.requestId).toBeDefined();

            // Verify address now exists for the user
            const secondLookup: any = await executor({
                document: parse(addressQuery),
                variables: { username: newUser },
                extensions: {
                    headers: { client: 'integration-test' }
                }
            });

            expect(secondLookup.data.address).toBeDefined();
            expect(secondLookup.data.address).toEqual({
                street: '100 Integration St'
            });

            // Attempt to create duplicate address (should fail)
            const duplicateAttempt: any = await executor({
                document: parse(createMutation),
                variables: {
                    username: newUser,
                    address: {
                        street: '200 Duplicate St',
                        city: 'TestCity',
                        state: 'TS',
                        zipcode: '54321'
                    }
                },
                extensions: {
                    headers: { client: 'integration-test' }
                }
            });

            expect(duplicateAttempt.errors).toBeDefined();
            expect(duplicateAttempt.errors[0].message).toContain('already has an address');
            expect(duplicateAttempt.errors[0].extensions.code).toBe('ADDRESS_ALREADY_EXISTS');
        });
    });

    describe('When tracking requests across the system', () => {
        test('generates unique identifier for each operation while maintaining consistency', async () => {
            const addressQuery = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
          }
        }
      `;

            // Execute the same query twice
            const firstRequest: any = await executor({
                document: parse(addressQuery),
                variables: { username: 'jack' },
                extensions: {
                    headers: { client: 'test' }
                }
            });

            const secondRequest: any = await executor({
                document: parse(addressQuery),
                variables: { username: 'jack' },
                extensions: {
                    headers: { client: 'test' }
                }
            });

            // Different requests get different identifiers
            expect(firstRequest.metadata.requestId).toBeDefined();
            expect(secondRequest.metadata.requestId).toBeDefined();
            expect(firstRequest.metadata.requestId).not.toBe(secondRequest.metadata.requestId);

            // Each identifier is a valid UUID
            const uuidPattern = /^[0-9a-f-]{36}$/i;
            expect(firstRequest.metadata.requestId).toMatch(uuidPattern);
            expect(secondRequest.metadata.requestId).toMatch(uuidPattern);
        });
    });
});