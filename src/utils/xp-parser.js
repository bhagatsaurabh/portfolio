export const parseText = (input) => {
  const result = [];
  let lastIndex = 0;
  for (const match of input.matchAll(/#(\w+)/g)) {
    const index = match.index;
    if (index > lastIndex) {
      result.push({
        type: "text",
        value: input.slice(lastIndex, index),
      });
    }
    result.push({
      type: "tag",
      value: match[1],
    });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < input.length) {
    result.push({
      type: "text",
      value: input.slice(lastIndex),
    });
  }

  return result;
};
