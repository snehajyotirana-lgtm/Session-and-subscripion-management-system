export const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request completed successfully.',
    data = null,
    meta = null,
  } = {},
) => {
  const payload = {
    success: true,
    message,
  };

  if (data !== null) {
    payload.data = data;
  }

  if (meta) {
    payload.meta = meta;
  }

  return res.status(statusCode).json(payload);
};
