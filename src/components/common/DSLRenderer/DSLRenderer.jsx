import React, { Fragment, lazy, Suspense } from "react";

const componentRegistry = {
  Avatar: lazy(() => import("@/components/common/Avatar/Avatar")),
  PerfControl: lazy(() => import("@/components/common/PerfControl/PerfControl")),
};

const WRAPPER_REGEX = /^\[([a-zA-Z][\w-]*)\](.*)$/s;
const COMPONENT_ONLY_REGEX = /^\$([A-Z]\w*)(?:\(([\w-]+)\))?$/;
const TOKEN_REGEX = /\$([A-Z]\w*)(?:\(([\w-]+)\))?|@(\w+)/g;

const DSLRenderer = ({ entries }) => {
  return (
    <>
      {entries.map((entry, index) => {
        const trimmed = entry.trim();

        const componentOnlyMatch = trimmed.match(COMPONENT_ONLY_REGEX);
        if (componentOnlyMatch) {
          const [, componentName, classNameKey] = componentOnlyMatch;
          return <Fragment key={index}>{renderComponent(componentName, classNameKey)}</Fragment>;
        }

        const wrapperMatch = trimmed.match(WRAPPER_REGEX);
        if (wrapperMatch) {
          const [, tagName, content] = wrapperMatch;
          const Tag = tagName;
          return <Tag key={index}>{renderMixedContent(content)}</Tag>;
        }

        return <Fragment key={index}>{renderMixedContent(trimmed)}</Fragment>;
      })}
    </>
  );
};

const renderMixedContent = (text) => {
  const nodes = [];
  let lastIndex = 0;
  TOKEN_REGEX.lastIndex = 0;

  let match;
  while ((match = TOKEN_REGEX.exec(text)) !== null) {
    const fullMatch = match[0];
    const matchIndex = match.index;

    if (matchIndex > lastIndex) {
      nodes.push(text.slice(lastIndex, matchIndex));
    }
    if (match[1]) {
      const componentName = match[1];
      const classNameKey = match[2];

      nodes.push(
        <Fragment key={nodes.length}>{renderComponent(componentName, classNameKey)}</Fragment>,
      );
    } else if (match[3]) {
      const modifier = match[3];
      switch (modifier) {
        case "n":
          nodes.push(<br key={nodes.length} />);
          break;
        default:
          nodes.push(fullMatch);
      }
    }
    lastIndex = matchIndex + fullMatch.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
};

const renderComponent = (componentName, classNameKey) => {
  const Component = componentRegistry[componentName];
  if (!Component) {
    console.warn(`Unknown DSL component: ${componentName}`);
    return null;
  }

  const resolvedClassName = classNameKey ? classNameKey : undefined;
  return (
    <Suspense fallback={"..."}>
      <Component className={resolvedClassName} />
    </Suspense>
  );
};

export default DSLRenderer;
