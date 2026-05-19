export const formatAge = (timestamp) => {
  const buildDate = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - buildDate.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.floor(diffMs / dayMs);

  if (days < 1) {
    return "Today";
  }
  if (days < 7) {
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  const weeks = Math.floor(days / 7);
  if (days < 30) {
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  const months = Math.floor(days / 30);
  if (days < 365) {
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  return `on ${buildDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  })}`;
};
