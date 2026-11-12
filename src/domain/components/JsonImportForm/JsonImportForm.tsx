import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/shared/components';
import { pluralize } from '@/lib/pluralize';
import { parseLogeekJson } from '@/domain/logic';
import { replaceBoardWithUndo } from '@/domain/store';
import styles from './JsonImportForm.module.scss';

export interface JsonImportFormProps {
  /** Called on Cancel and after a successful import. */
  onClose: () => void;
}

/** Rebuilds the board from pasted Logeek JSON, with Undo in the toast. */
function JsonImportForm({ onClose }: JsonImportFormProps) {
  const [jsonText, setJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const fieldId = useId();
  const hintId = useId();
  const errorId = useId();

  // Runs after the Modal's layout effect, so the dialog is open and the
  // field can take focus from the dialog's own first pick.
  useEffect(() => {
    fieldRef.current?.focus();
  }, []);

  const importCards = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const { board, error } = parseLogeekJson(jsonText);
    if (!board) {
      setImportError(error);
      fieldRef.current?.focus();
      return;
    }

    replaceBoardWithUndo(board, `Imported ${pluralize(board.cards.length, 'card')} from JSON.`);
    onClose();
  };

  return (
    <form className={styles.form} onSubmit={importCards}>
      <label htmlFor={fieldId} className={styles.label}>
        Logeek JSON
      </label>
      <p id={hintId} className={styles.hint}>
        Paste JSON in the Logeek format, as the Cards to JSON view gives it. Its cards and variables
        replace this board (Undo brings it back). Colours and test values start fresh.
      </p>
      <textarea
        ref={fieldRef}
        id={fieldId}
        className={styles.field}
        value={jsonText}
        rows={12}
        spellCheck={false}
        autoComplete="off"
        placeholder='{ "variables": { ... }, "decisions": [ ... ], "otherwise": "..." }'
        aria-describedby={importError ? `${hintId} ${errorId}` : hintId}
        aria-invalid={importError !== null}
        onChange={(event) => {
          setJsonText(event.target.value);
          setImportError(null);
        }}
      />
      {importError && (
        <p id={errorId} role="alert" className={styles.error}>
          Could not import: {importError}.
        </p>
      )}
      <div className={styles.actions}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="primary" icon="upload" disabled={jsonText.trim() === ''}>
          Import cards
        </Button>
      </div>
    </form>
  );
}

export default JsonImportForm;
