export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

export const normalizeWallet = (address) => {
  if (!address || typeof address !== "string") {
    return null;
  }
  const trimmed = address.trim();
  if (!ETH_ADDRESS_REGEX.test(trimmed)) {
    return null;
  }
  return trimmed.toLowerCase();
};

export const isZeroAddress = (address) => {
  const normalized = normalizeWallet(address);
  return !normalized || normalized === ZERO_ADDRESS.toLowerCase();
};
