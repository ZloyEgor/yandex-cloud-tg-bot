export const parseArguments = (input: string | undefined): string[] => {
  return input ? (input.split(' ').slice(1)) : [];
};