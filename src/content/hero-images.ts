export const heroLeftImages = [
  "e91dc062a1a59f16", "57cb78ce7e06b163", "64fca4272dfdc8cd", "a370e8f239fd8425",
  "dcb9b722713b8e60", "1e59c3163b8cf57f", "ab4b8ac7fe797408", "9032a9e3c276e74c",
  "208281e65159850b", "21ff60b5fbfba415", "ff52c994a68122be", "60a0b5dcb8fefee0",
  "9e5a52b06e87a993", "2992efd92d63fba1",
].map((name) => `/assets/home/hero/${name}.png`);

export const heroRightImages = [
  "7414e5ade0071462", "0615313848989a07", "f1eae0767b049122", "f1eae0767b049122",
  "2b4f9d39b93fcbfc", "1137b80ce6f84421", "cf52df744008140d", "3c841850363f9998",
  "cd31d1301a875461", "70b004c27847af0b", "7ee0e539f319e6c2", "228449da58b524e4",
  "827d5004dd28385f", "ba328ce711bc9c9a",
].map((name) => `/assets/home/hero/${name}.png`);

export const heroImages = [...new Set([...heroLeftImages, ...heroRightImages])];
