const pennyApiBase = (import.meta.env.VITE_API_URL || "/api").replace(
  /\/$/,
  "",
);

export async function request(endpointPath, requestOptions = {}) {
  let apiReply;
  try {
    apiReply = await fetch(`${pennyApiBase}${endpointPath}`, {
      ...requestOptions,
      headers: {
        "Content-Type": "application/json",
        ...requestOptions.headers,
      },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new Error(
      "Cannot reach Penny. Check that the backend is running and try again.",
    );
  }
  const replyBody = await apiReply.json().catch(() => null);
  if (!apiReply.ok || !replyBody) {
    const apiFailure = new Error(
      replyBody?.message ||
        "Could not load your expenses. Check that the backend is running.",
    );
    apiFailure.fields = replyBody?.errors;
    throw apiFailure;
  }
  return replyBody;
}
