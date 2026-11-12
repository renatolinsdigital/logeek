import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createId } from '@/lib/createId';
import {
  CARD_COLORS,
  type Board,
  type Condition,
  type ConditionGroup,
  type GroupMatch,
  type JsonFormat,
  type LogicCard,
  type Variable,
  type VariableType,
} from '@/domain/models';
import {
  appendNode,
  cloneWithNewIds,
  collectConditions,
  createExampleBoard,
  getDefaultOperator,
  getDefaultValue,
  isOperatorAllowed,
  mapConditions,
  parseBoard,
  removeNode,
  updateNode,
} from '@/domain/logic';

export type ConditionPatch = Partial<Pick<Condition, 'variableId' | 'operator' | 'value'>>;
export type CardPatch = Partial<Pick<LogicCard, 'title' | 'then'>>;

interface BoardData extends Board {
  jsonFormat: JsonFormat;
  isJsonCompact: boolean;
}

interface BoardActions {
  addVariable: (name: string, type: VariableType) => void;
  renameVariable: (variableId: string, name: string) => void;
  changeVariableType: (variableId: string, type: VariableType) => void;
  setVariableSample: (variableId: string, sample: string) => void;
  removeVariable: (variableId: string) => void;

  addCard: () => string;
  updateCard: (cardId: string, patch: CardPatch) => void;
  cycleCardColor: (cardId: string) => void;
  duplicateCard: (cardId: string) => void;
  moveCard: (cardId: string, offset: -1 | 1) => void;
  removeCard: (cardId: string) => void;
  restoreRemovedCard: () => void;

  addCondition: (cardId: string, groupId: string) => void;
  addGroup: (cardId: string) => void;
  updateCondition: (cardId: string, conditionId: string, patch: ConditionPatch) => void;
  setGroupMatch: (cardId: string, groupId: string, match: GroupMatch) => void;
  removeNode: (cardId: string, nodeId: string) => void;

  setOtherwise: (otherwise: string) => void;
  loadBoard: (board: Board) => void;
  resetToExamples: () => void;
  clearBoard: () => void;
  setJsonFormat: (format: JsonFormat) => void;
  setJsonCompact: (isCompact: boolean) => void;
}

export interface BoardState extends BoardData, BoardActions {
  /** The last removed card and where it was, so a toast can bring it back. */
  lastRemovedCard: { card: LogicCard; index: number } | null;
}

function createEmptyBoard(): Board {
  return { variables: [], cards: [], otherwise: '' };
}

export function createInitialBoardData(): BoardData {
  return { ...createEmptyBoard(), jsonFormat: 'logeek', isJsonCompact: false };
}

function createEmptyGroup(match: GroupMatch = 'all'): ConditionGroup {
  return { id: createId('group'), kind: 'group', match, items: [] };
}

function createCondition(variable: Variable): Condition {
  return {
    id: createId('condition'),
    kind: 'condition',
    variableId: variable.id,
    operator: getDefaultOperator(variable.type),
    value: getDefaultValue(variable.type),
  };
}

/** Counts the conditions, across every card, that read this variable. */
export function countVariableUses(cards: readonly LogicCard[], variableId: string): number {
  return cards
    .flatMap((card) => collectConditions(card.when))
    .filter((condition) => condition.variableId === variableId).length;
}

export const useBoardStore = create<BoardState>()(
  persist(
    (set, get) => {
      const updateCardById = (cardId: string, update: (card: LogicCard) => LogicCard) =>
        set((state) => ({
          cards: state.cards.map((card) => (card.id === cardId ? update(card) : card)),
        }));

      const updateCardTree = (
        cardId: string,
        update: (rootGroup: ConditionGroup) => ConditionGroup,
      ) => updateCardById(cardId, (card) => ({ ...card, when: update(card.when) }));

      return {
        ...createInitialBoardData(),
        lastRemovedCard: null,

        addVariable: (name, type) =>
          set((state) => ({
            variables: [
              ...state.variables,
              { id: createId('variable'), name, type, sample: getDefaultValue(type) },
            ],
          })),

        renameVariable: (variableId, name) =>
          set((state) => ({
            variables: state.variables.map((variable) =>
              variable.id === variableId ? { ...variable, name } : variable,
            ),
          })),

        // A new type invalidates the old values, so every condition on the
        // variable starts over with the new type's defaults.
        changeVariableType: (variableId, type) =>
          set((state) => ({
            variables: state.variables.map((variable) =>
              variable.id === variableId
                ? { ...variable, type, sample: getDefaultValue(type) }
                : variable,
            ),
            cards: state.cards.map((card) => ({
              ...card,
              when: mapConditions(card.when, (condition) =>
                condition.variableId === variableId
                  ? {
                      ...condition,
                      operator: getDefaultOperator(type),
                      value: getDefaultValue(type),
                    }
                  : condition,
              ),
            })),
          })),

        setVariableSample: (variableId, sample) =>
          set((state) => ({
            variables: state.variables.map((variable) =>
              variable.id === variableId ? { ...variable, sample } : variable,
            ),
          })),

        removeVariable: (variableId) => {
          if (countVariableUses(get().cards, variableId) > 0) return;
          set((state) => ({
            variables: state.variables.filter((variable) => variable.id !== variableId),
          }));
        },

        addCard: () => {
          const { cards, variables } = get();
          const [firstVariable] = variables;
          const rootGroup = createEmptyGroup();
          if (firstVariable) rootGroup.items.push(createCondition(firstVariable));

          const newCard: LogicCard = {
            id: createId('card'),
            title: `Card ${cards.length + 1}`,
            color: CARD_COLORS[cards.length % CARD_COLORS.length] ?? 'pink',
            when: rootGroup,
            then: '',
          };
          set({ cards: [...cards, newCard] });
          return newCard.id;
        },

        updateCard: (cardId, patch) => updateCardById(cardId, (card) => ({ ...card, ...patch })),

        cycleCardColor: (cardId) =>
          updateCardById(cardId, (card) => {
            const colorIndex = CARD_COLORS.indexOf(card.color);
            return { ...card, color: CARD_COLORS[(colorIndex + 1) % CARD_COLORS.length] ?? 'pink' };
          }),

        duplicateCard: (cardId) =>
          set((state) => {
            const cardIndex = state.cards.findIndex((card) => card.id === cardId);
            const originalCard = state.cards[cardIndex];
            if (!originalCard) return {};

            const copiedCard: LogicCard = {
              ...originalCard,
              id: createId('card'),
              title: `${originalCard.title} (copy)`,
              when: cloneWithNewIds(originalCard.when, (kind) => createId(kind)),
            };
            const cards = [...state.cards];
            cards.splice(cardIndex + 1, 0, copiedCard);
            return { cards };
          }),

        moveCard: (cardId, offset) =>
          set((state) => {
            const cardIndex = state.cards.findIndex((card) => card.id === cardId);
            const targetIndex = cardIndex + offset;
            if (cardIndex < 0 || targetIndex < 0 || targetIndex >= state.cards.length) return {};

            const cards = [...state.cards];
            const [movedCard] = cards.splice(cardIndex, 1);
            if (movedCard) cards.splice(targetIndex, 0, movedCard);
            return { cards };
          }),

        removeCard: (cardId) =>
          set((state) => {
            const cardIndex = state.cards.findIndex((card) => card.id === cardId);
            const removedCard = state.cards[cardIndex];
            if (!removedCard) return {};
            return {
              cards: state.cards.filter((card) => card.id !== cardId),
              lastRemovedCard: { card: removedCard, index: cardIndex },
            };
          }),

        restoreRemovedCard: () =>
          set((state) => {
            if (!state.lastRemovedCard) return {};
            const { card, index } = state.lastRemovedCard;
            const variableIds = new Set(state.variables.map((variable) => variable.id));
            const hasMissingVariable = collectConditions(card.when).some(
              (condition) => !variableIds.has(condition.variableId),
            );
            if (hasMissingVariable) return { lastRemovedCard: null };

            const cards = [...state.cards];
            cards.splice(Math.min(index, cards.length), 0, card);
            return { cards, lastRemovedCard: null };
          }),

        addCondition: (cardId, groupId) => {
          const [firstVariable] = get().variables;
          if (!firstVariable) return;
          updateCardTree(cardId, (rootGroup) =>
            appendNode(rootGroup, groupId, createCondition(firstVariable)),
          );
        },

        addGroup: (cardId) => {
          const [firstVariable] = get().variables;
          const newGroup = createEmptyGroup('any');
          if (firstVariable) newGroup.items.push(createCondition(firstVariable));
          updateCardTree(cardId, (rootGroup) => appendNode(rootGroup, rootGroup.id, newGroup));
        },

        updateCondition: (cardId, conditionId, patch) => {
          const variableLookup = new Map(
            get().variables.map((variable) => [variable.id, variable]),
          );
          updateCardTree(cardId, (rootGroup) =>
            updateNode(rootGroup, conditionId, (node) => {
              if (node.kind !== 'condition') return node;
              const updatedCondition = { ...node, ...patch };
              const previousVariable = variableLookup.get(node.variableId);
              const nextVariable = variableLookup.get(updatedCondition.variableId);
              if (!nextVariable) return node;

              if (previousVariable?.type !== nextVariable.type) {
                updatedCondition.value = getDefaultValue(nextVariable.type);
              }
              if (!isOperatorAllowed(updatedCondition.operator, nextVariable.type)) {
                updatedCondition.operator = getDefaultOperator(nextVariable.type);
              }
              return updatedCondition;
            }),
          );
        },

        setGroupMatch: (cardId, groupId, match) =>
          updateCardTree(cardId, (rootGroup) =>
            updateNode(rootGroup, groupId, (node) =>
              node.kind === 'group' ? { ...node, match } : node,
            ),
          ),

        removeNode: (cardId, nodeId) =>
          updateCardTree(cardId, (rootGroup) => removeNode(rootGroup, nodeId)),

        setOtherwise: (otherwise) => set({ otherwise }),

        loadBoard: (board) => set({ ...board, lastRemovedCard: null }),

        resetToExamples: () => set({ ...createExampleBoard(), lastRemovedCard: null }),

        clearBoard: () => set({ ...createEmptyBoard(), lastRemovedCard: null }),

        setJsonFormat: (jsonFormat) => set({ jsonFormat }),

        setJsonCompact: (isJsonCompact) => set({ isJsonCompact }),
      };
    },
    {
      name: 'logeek-board',
      version: 1,
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ variables, cards, otherwise, jsonFormat, isJsonCompact }) => ({
        variables,
        cards,
        otherwise,
        jsonFormat,
        isJsonCompact,
      }),
      // Saved storage is untrusted (an older version, a hand edit): it passes
      // the same checks as a shared link, or the board starts empty instead.
      merge: (persistedState, currentState) => {
        const savedState = (persistedState ?? {}) as Partial<BoardData>;
        const savedBoard = parseBoard(savedState);
        if (!savedBoard) return currentState;
        return {
          ...currentState,
          ...savedBoard,
          jsonFormat: savedState.jsonFormat === 'jsonlogic' ? 'jsonlogic' : 'logeek',
          isJsonCompact: savedState.isJsonCompact === true,
        };
      },
    },
  ),
);

/** The logic part of the state, for exports, the flowchart and share links. */
export function selectBoard(state: BoardState): Board {
  return { variables: state.variables, cards: state.cards, otherwise: state.otherwise };
}
