import { parse } from 'graphql';
import { executorPromise } from '../exectuor';

describe('createAddress Mutation', () => {
    let executor: any;

    beforeAll(async () => {
        executor = await executorPromise;
    });

    describe('When creating a new address', () => {
        test('creates address successfully with all fields', async () => {
            const mutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
            city
            state
            zipcode
          }
        }
      `;

            const username = `test_create_${Date.now()}`;
            const result: any = await executor({
                document: parse(mutation),
                variables: {
                    username,
                    address: {
                        street: '999 Test Street',
                        city: 'TestCity',
                        state: 'TestState',
                        zipcode: '99999'
                    }
                },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            expect(result.data.createAddress).toEqual({
                street: '999 Test Street',
                city: 'TestCity',
                state: 'TestState',
                zipcode: '99999'
            });

            expect(result.metadata).toBeDefined();
            expect(result.metadata.requestId).toBeDefined();
        });
    });

    describe('When address already exists', () => {
        test('returns error and does not create duplicate', async () => {
            const mutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
          }
        }
      `;

            const result: any = await executor({
                document: parse(mutation),
                variables: {
                    username: 'jack',
                    address: {
                        street: '123 Duplicate St',
                        city: 'DuplicateCity',
                        state: 'DC',
                        zipcode: '11111'
                    }
                },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            expect(result.errors).toBeDefined();
            expect(result.errors[0].message).toContain('already has an address on file');
            expect(result.errors[0].extensions).toEqual(
                expect.objectContaining({
                    code: 'ADDRESS_ALREADY_EXISTS',
                    username: 'jack',
                })
            );
        });
    });

    describe('When client header is missing', () => {
        test('rejects the request with clear error message', async () => {
            const mutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
          }
        }
      `;

            const result: any = await executor({
                document: parse(mutation),
                variables: {
                    username: `test_noheader_${Date.now()}`,
                    address: {
                        street: '123 New St',
                        city: 'NewCity',
                        state: 'NS',
                        zipcode: '12345'
                    }
                },
            });

            expect(result.errors).toBeDefined();
            expect(result.errors[0]).toEqual(
                expect.objectContaining({
                    message: 'Missing required "client" header',
                    extensions: expect.objectContaining({
                        code: 'MISSING_HEADER',
                    }),
                })
            );
        });
    });

    describe('When input validation fails', () => {
        test('requires all address fields to be provided', async () => {
            const mutation = `
        mutation CreateAddress($username: String!, $address: AddressInput!) {
          createAddress(username: $username, address: $address) {
            street
          }
        }
      `;

            const result: any = await executor({
                document: parse(mutation),
                variables: {
                    username: 'testvalidation',
                    address: {
                        street: '123 Test',
                        // Missing city, state, zipcode
                    } as any
                },
                extensions: {
                    headers: {
                        client: 'test-client'
                    }
                }
            });

            expect(result.errors).toBeDefined();
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
});