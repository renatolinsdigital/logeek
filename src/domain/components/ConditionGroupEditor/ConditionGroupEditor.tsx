import { Fragment } from 'react';
import { Button, SegmentedControl } from '@/shared/components';
import { classNames } from '@/lib/classNames';
import type { ConditionGroup, GroupMatch, Variable } from '@/domain/models';
import { useBoardStore } from '@/domain/store';
import { ConditionRow } from '../ConditionRow';
import styles from './ConditionGroupEditor.module.scss';

export interface ConditionGroupEditorProps {
  cardId: string;
  group: ConditionGroup;
  variables: readonly Variable[];
  /** The card's own group reads "IF"; a nested one reads "GROUP" and can be removed. */
  isRoot?: boolean;
}

const MATCH_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'any', label: 'Any' },
] as const;

/** A list of conditions joined by AND (all) or OR (any). The card's root may hold one level of groups. */
function ConditionGroupEditor({
  cardId,
  group,
  variables,
  isRoot = false,
}: ConditionGroupEditorProps) {
  const setGroupMatch = useBoardStore((state) => state.setGroupMatch);
  const addCondition = useBoardStore((state) => state.addCondition);
  const addGroup = useBoardStore((state) => state.addGroup);
  const removeNode = useBoardStore((state) => state.removeNode);
  const hasVariables = variables.length > 0;
  const joinWord = group.match === 'all' ? 'AND' : 'OR';
  const emptyText = isRoot
    ? 'No conditions: this card always passes.'
    : group.match === 'all'
      ? 'Empty group: always passes.'
      : 'Empty group: never passes.';

  return (
    <div className={classNames(styles.group, !isRoot && styles.nested)} data-match={group.match}>
      <div className={styles.header}>
        <span className={styles.keyword}>{isRoot ? 'If' : 'Group'}</span>
        <SegmentedControl<GroupMatch>
          legend={isRoot ? 'Card conditions must match' : 'Group conditions must match'}
          options={MATCH_OPTIONS}
          value={group.match}
          size="sm"
          onChange={(match) => setGroupMatch(cardId, group.id, match)}
        />
        <span className={styles.hint}>of these are true</span>
        {!isRoot && (
          <Button
            className={styles.removeGroup}
            variant="ghost"
            size="sm"
            icon="trash"
            label="Remove group"
            onClick={() => removeNode(cardId, group.id)}
          />
        )}
      </div>

      {group.items.length === 0 ? (
        <p className={styles.empty}>{emptyText}</p>
      ) : (
        <ul className={styles.items}>
          {group.items.map((item, itemIndex) => (
            <Fragment key={item.id}>
              {itemIndex > 0 && (
                <li className={styles.join} aria-hidden="true">
                  <span>{joinWord}</span>
                </li>
              )}
              <li>
                {item.kind === 'group' ? (
                  <ConditionGroupEditor cardId={cardId} group={item} variables={variables} />
                ) : (
                  <ConditionRow cardId={cardId} condition={item} variables={variables} />
                )}
              </li>
            </Fragment>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <Button
          size="sm"
          icon="plus"
          disabled={!hasVariables}
          title={hasVariables ? undefined : 'Create a variable first'}
          onClick={() => addCondition(cardId, group.id)}
        >
          Condition
        </Button>
        {isRoot && (
          <Button size="sm" icon="plus" disabled={!hasVariables} onClick={() => addGroup(cardId)}>
            Group
          </Button>
        )}
      </div>
    </div>
  );
}

export default ConditionGroupEditor;
