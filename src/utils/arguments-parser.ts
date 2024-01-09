export const parseArguments = (input: string | undefined) => {
  return input ? (input.split(' ').slice(1)) : [];
};