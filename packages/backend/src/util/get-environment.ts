export const getEnvironmentVariable = (key: string) => {
  const value = process.env[key];
  if (value == null || value === '') {
    throw new Error(`Environment Variable ${key} is null or empty`);
  }
  return value;
};
