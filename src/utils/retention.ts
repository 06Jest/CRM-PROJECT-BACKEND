export const getRetentionCutoffDate = (
  months: number
): string => {

  const date = new Date();

  date.setMonth(
    date.getMonth() - months
  );


  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1
  ).toISOString();
};