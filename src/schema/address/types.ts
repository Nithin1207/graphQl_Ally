
export type Address = {
  street: string;
  city: string;
  state: string;
  zipcode: string;
};

export type Addresses = Record<string, Address>;

export type AddressInput = Address;

export type GetAddressArgs = {
  username: string;
};

export type CreateAddressArgs = {
  username: string;
  address: AddressInput;
};