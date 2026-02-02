import fs from 'fs';
import path from 'path';
import addressTable from '../../../data/addresses.json';
import { Addresses, Address, GetAddressArgs, CreateAddressArgs } from './types';
import { GraphQLError } from 'graphql';
const ADDRESSES_PATH = path.join(__dirname, '../../../data/addresses.json');

// In this code i use helper functions to avoid repeating code, and also i gave proper error messages, helps if something breaks.

const addresses: Addresses = addressTable as Addresses;

const _getAddress = (username: string): Address | null => {
  return addresses[username] ?? null;
};

const _saveAddresses = (): void => {
  fs.writeFileSync(ADDRESSES_PATH, JSON.stringify(addresses, null, 2), 'utf-8');
};


export const getAddress = (_: unknown, args: GetAddressArgs, context: any): Address => {
  const { username } = args;

  context.logger.info('Fetching address', { username });

  const address = _getAddress(username);

  if (!address) {
    context.logger.error('Address not found', { username });
    throw new GraphQLError(`User '${username}' does not have an address on file`, {
      extensions: {
        code: 'ADDRESS_NOT_FOUND',
        username,
      }
    });
  }

  context.logger.info('Address retrieved successfully', { username });
  return address;
};


export const createAddress = (_: unknown, args: CreateAddressArgs, context: any): Address => {
  const { username, address } = args;

  context.logger.info('Creating address', { username });


  // I'm add just for extra validation
  if (!address) {
    throw new GraphQLError('Address input is required', {
      extensions: {
        code: 'INVALID_INPUT',
      }
    });
  }


  if (addresses[username]) {
    context.logger.error('Address already exists', { username });
    throw new GraphQLError(`User '${username}' already has an address on file`, {
      extensions: {
        code: 'ADDRESS_ALREADY_EXISTS',
        username,
      }
    });
  }


  addresses[username] = address;
  _saveAddresses();

  context.logger.info('Address created successfully', { username });
  return address;
};