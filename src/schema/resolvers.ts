import { getAddress, createAddress } from "./address/address";



//i shortened these function to look short and clean

export const resolvers = {
  Query: {
    address: getAddress,
  },
  Mutation: {
    createAddress,
  },
};