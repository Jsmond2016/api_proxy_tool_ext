export interface ResponseSearchMatch {
  path: string;
}

const getChildPath = (parentPath: string, key: string | number) => {
  if (typeof key === "number") {
    return `${parentPath}[${key}]`;
  }

  return /^[A-Za-z_$][\w$]*$/.test(key)
    ? `${parentPath}.${key}`
    : `${parentPath}[${JSON.stringify(key)}]`;
};

const countMatches = (value: string, keyword: string) => {
  const normalizedValue = value.toLocaleLowerCase();
  const normalizedKeyword = keyword.toLocaleLowerCase();
  let count = 0;
  let startIndex = 0;

  while (startIndex < normalizedValue.length) {
    const matchIndex = normalizedValue.indexOf(normalizedKeyword, startIndex);
    if (matchIndex === -1) {
      break;
    }

    count += 1;
    startIndex = matchIndex + normalizedKeyword.length;
  }

  return count;
};

const getPrimitiveText = (value: unknown) => {
  if (typeof value === "string") {
    return value;
  }

  return String(value);
};

export const findResponseSearchMatches = (
  responseData: unknown,
  keyword: string,
): ResponseSearchMatch[] => {
  const trimmedKeyword = keyword.trim();
  if (!trimmedKeyword) {
    return [];
  }

  const matches: ResponseSearchMatch[] = [];
  const addMatches = (value: string, path: string) => {
    const matchCount = countMatches(value, trimmedKeyword);
    for (let index = 0; index < matchCount; index += 1) {
      matches.push({ path });
    }
  };

  const visit = (value: unknown, path: string) => {
    if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, getChildPath(path, index)));
      return;
    }

    if (value !== null && typeof value === "object") {
      Object.entries(value).forEach(([key, item]) => {
        const childPath = getChildPath(path, key);
        addMatches(key, childPath);
        visit(item, childPath);
      });
      return;
    }

    addMatches(getPrimitiveText(value), path);
  };

  visit(responseData, "$");
  return matches;
};
