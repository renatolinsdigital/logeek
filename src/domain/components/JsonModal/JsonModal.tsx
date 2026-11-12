import { useState } from 'react';
import { Modal, SegmentedControl } from '@/shared/components';
import { JsonExport } from '../JsonExport';
import { JsonImportForm } from '../JsonImportForm';
import styles from './JsonModal.module.scss';

type JsonDirection = 'cardsToJson' | 'jsonToCards';

const DIRECTION_OPTIONS = [
  { value: 'cardsToJson', label: 'Cards to JSON' },
  { value: 'jsonToCards', label: 'JSON to cards' },
] as const;

export interface JsonModalProps {
  onClose: () => void;
}

/** Both ways between the board and JSON: see the cards as JSON, or build cards from pasted JSON. */
function JsonModal({ onClose }: JsonModalProps) {
  const [direction, setDirection] = useState<JsonDirection>('cardsToJson');

  return (
    <Modal title="JSON" closeLabel="Close JSON" onClose={onClose}>
      <div className={styles.body}>
        <SegmentedControl<JsonDirection>
          legend="Direction"
          options={DIRECTION_OPTIONS}
          value={direction}
          onChange={setDirection}
        />
        {direction === 'cardsToJson' ? <JsonExport /> : <JsonImportForm onClose={onClose} />}
      </div>
    </Modal>
  );
}

export default JsonModal;
