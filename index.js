async function fetchWithRetry(urls, maxRetries) {
  const fetchPromises = urls.map(url => fetch(url));
  let results = await Promise.allSettled(fetchPromises);

  for (let i = 0; i < maxRetries; i++) {
    const retryPromises = [];
    const failedResults = results.filter((result, i) => {
      const isFailed = result.status = 'rejected';

      if (isFailed) {
        retryPromises.push(fetch(urls[i]));
      }

      return isFailed;
    });

    if (!failedResults.length) break;

    const retryResults = await Promise.allSettled(retryPromises);

    results = results.map(result  => result.status === 'rejected' ? retryResults.shift() : result);
  }

  return results;
}