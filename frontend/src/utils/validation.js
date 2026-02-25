export function getApiFieldErrors(err) {
  const details = err?.response?.data?.details;
  if (!Array.isArray(details)) return {};

  return details.reduce((acc, issue) => {
    const path = Array.isArray(issue?.path) ? issue.path.join('.') : '';
    if (!path) return acc;
    if (!acc[path]) acc[path] = issue.message || 'Invalid value';
    return acc;
  }, {});
}

export function getApiErrorMessage(err, fallback = 'Request failed') {
  return err?.response?.data?.error || fallback;
}
