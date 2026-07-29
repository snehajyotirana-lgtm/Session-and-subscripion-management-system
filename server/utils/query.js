export const getPagination = (query) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const buildPaginationMeta = ({ total, page, limit }) => ({
  total,
  page,
  limit,
  totalPages: Math.max(Math.ceil(total / limit), 1),
});

export const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const buildDateRangeFilter = (fieldName, dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) {
    return {};
  }

  const filter = {};

  if (dateFrom) {
    filter.$gte = new Date(dateFrom);
  }

  if (dateTo) {
    filter.$lte = new Date(dateTo);
  }

  return { [fieldName]: filter };
};
