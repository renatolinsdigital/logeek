import type { Condition, ConditionGroup, LogicNode } from '@/domain/models';

function mapNode(
  node: LogicNode,
  targetNodeId: string,
  update: (node: LogicNode) => LogicNode,
): LogicNode {
  if (node.id === targetNodeId) return update(node);
  if (node.kind === 'condition') return node;
  return { ...node, items: node.items.map((child) => mapNode(child, targetNodeId, update)) };
}

/** Returns a copy of the tree with the node of that id replaced by `update(node)`. */
export function updateNode(
  rootGroup: ConditionGroup,
  targetNodeId: string,
  update: (node: LogicNode) => LogicNode,
): ConditionGroup {
  return mapNode(rootGroup, targetNodeId, update) as ConditionGroup;
}

/** Returns a copy of the tree without the node of that id (and anything inside it). */
export function removeNode(rootGroup: ConditionGroup, targetNodeId: string): ConditionGroup {
  return {
    ...rootGroup,
    items: rootGroup.items
      .filter((child) => child.id !== targetNodeId)
      .map((child) => (child.kind === 'group' ? removeNode(child, targetNodeId) : child)),
  };
}

export function appendNode(
  rootGroup: ConditionGroup,
  targetGroupId: string,
  newNode: LogicNode,
): ConditionGroup {
  return updateNode(rootGroup, targetGroupId, (node) =>
    node.kind === 'group' ? { ...node, items: [...node.items, newNode] } : node,
  );
}

export function mapConditions(
  rootGroup: ConditionGroup,
  update: (condition: Condition) => Condition,
): ConditionGroup {
  return {
    ...rootGroup,
    items: rootGroup.items.map((child) =>
      child.kind === 'group' ? mapConditions(child, update) : update(child),
    ),
  };
}

export function collectConditions(rootGroup: ConditionGroup): Condition[] {
  return rootGroup.items.flatMap((child) =>
    child.kind === 'group' ? collectConditions(child) : [child],
  );
}

/** Copies a tree, giving every node a fresh id, for a duplicated card. */
export function cloneWithNewIds(
  rootGroup: ConditionGroup,
  createNodeId: (kind: LogicNode['kind']) => string,
): ConditionGroup {
  return {
    ...rootGroup,
    id: createNodeId('group'),
    items: rootGroup.items.map((child) =>
      child.kind === 'group'
        ? cloneWithNewIds(child, createNodeId)
        : { ...child, id: createNodeId('condition') },
    ),
  };
}
