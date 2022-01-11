import Web3 from 'web3';

export const validateAddress = (address: string) => {
  try {
    Web3.utils.toChecksumAddress(address);
    return true;
  } catch (e) {
    return false;
  }
};
