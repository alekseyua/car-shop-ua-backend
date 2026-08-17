export const buildPagination = (
  page: number = 2,
  limit: number = 5,
): {
  skip: number;
  take: number;
} => {
  const s = (page - 1) * limit;
  return {
    skip: Number(s),
    take: Number(limit),
  };
};

export const sliceArrayPagination = (arr: [], skip: number, take: number) => {
  return arr.slice(skip, skip + take);
};
