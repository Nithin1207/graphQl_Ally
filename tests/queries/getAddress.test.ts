import { parse } from 'graphql';
import { executorPromise } from '../exectuor';

describe('getAddress Query', () => {
  let executor: any;

  beforeAll(async () => {
    executor = await executorPromise;
  });

  describe('When query is successful', () => {
    test('returns address with all fields including state', async () => {
      const query = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
            city
            state
            zipcode
          }
        }
      `;

      const result = await executor({
        document: parse(query),
        variables: { username: 'jack' },
        extensions: {
          headers: {
            client: 'test-client',
          },
        },
      });

      expect(result).toEqual({
        data: {
          address: {
            street: '123 Street St.',
            city: 'Sometown',
            state: 'Ohio',
            zipcode: '43215',
          },
        },
        metadata: {
          requestId: expect.any(String),
        },
      });

      // here i use regex to make sure the requestId is actually a valid UUID
      expect(result.metadata.requestId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });
  });

  describe('When query has errors', () => {
    test('returns helpful error when user does not exist', async () => {
      const query = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
            city
            state
            zipcode
          }
        }
      `;

      const result = await executor({
        document: parse(query),
        variables: { username: '__does_not_exist__' },
        extensions: {
          headers: {
            client: 'test-client',
          },
        },
      });

      expect(result).toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: expect.stringContaining('does not have an address on file'),
              extensions: expect.objectContaining({
                code: 'ADDRESS_NOT_FOUND',
                username: '__does_not_exist__',
              }),
            }),
          ]),
          data: {
            address: null,
          },
          metadata: {
            requestId: expect.any(String),
          },
        })
      );
    });

    test('rejects request when client header is missing', async () => {
      const query = `
        query GetAddress($username: String!) {
          address(username: $username) {
            street
            city
            state
            zipcode
          }
        }
      `;

      const result = await executor({
        document: parse(query),
        variables: { username: 'jack' },
        extensions: {
          headers: {},
        },
      });

      expect(result).toEqual(
        expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              message: 'Missing required "client" header',
              extensions: expect.objectContaining({
                code: 'MISSING_HEADER',
              }),
            }),
          ]),
        })
      );
    });
  });
});