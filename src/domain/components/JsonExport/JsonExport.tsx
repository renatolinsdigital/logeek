import { useMemo } from 'react';
import { Button, JsonCode, SegmentedControl, showToast } from '@/shared/components';
import type { JsonFormat } from '@/domain/models';
import { formatBoardJson } from '@/domain/logic';
import { useBoard, useBoardStore } from '@/domain/store';
import styles from './JsonExport.module.scss';

const FORMAT_OPTIONS = [
  { value: 'logeek', label: 'Logeek' },
  { value: 'jsonlogic', label: 'JsonLogic' },
] as const;

const LAYOUT_OPTIONS = [
  { value: 'pretty', label: 'Pretty' },
  { value: 'compact', label: 'Compact' },
] as const;

const FORMAT_NOTES: Record<JsonFormat, string> = {
  logeek:
    'Readable by people and easy to parse: decisions run top to bottom, the first match answers.',
  jsonlogic:
    'One JsonLogic rule (jsonlogic.com): run it with any JsonLogic library, passing the variables as data.',
};

const FILE_NAMES: Record<JsonFormat, string> = {
  logeek: 'logeek-board.json',
  jsonlogic: 'logeek-jsonlogic.json',
};

/** The cards as JSON, in the chosen format, ready to copy or download. */
function JsonExport() {
  const board = useBoard();
  const jsonFormat = useBoardStore((state) => state.jsonFormat);
  const isJsonCompact = useBoardStore((state) => state.isJsonCompact);
  const setJsonFormat = useBoardStore((state) => state.setJsonFormat);
  const setJsonCompact = useBoardStore((state) => state.setJsonCompact);
  const jsonText = useMemo(
    () => formatBoardJson(board, jsonFormat, isJsonCompact),
    [board, jsonFormat, isJsonCompact],
  );

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText);
      showToast('JSON copied to the clipboard.');
    } catch {
      showToast('The browser blocked the clipboard. Select the JSON and copy it by hand.');
    }
  };

  const downloadJson = () => {
    const fileUrl = URL.createObjectURL(new Blob([jsonText], { type: 'application/json' }));
    const downloadLink = document.createElement('a');
    downloadLink.href = fileUrl;
    downloadLink.download = FILE_NAMES[jsonFormat];
    downloadLink.click();
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className={styles.export}>
      <p className={styles.note}>{FORMAT_NOTES[jsonFormat]}</p>
      <div className={styles.toolbar}>
        <SegmentedControl<JsonFormat>
          legend="Format"
          isLegendVisible
          size="sm"
          options={FORMAT_OPTIONS}
          value={jsonFormat}
          onChange={setJsonFormat}
        />
        <SegmentedControl<'pretty' | 'compact'>
          legend="Layout"
          isLegendVisible
          size="sm"
          options={LAYOUT_OPTIONS}
          value={isJsonCompact ? 'compact' : 'pretty'}
          onChange={(layout) => setJsonCompact(layout === 'compact')}
        />
      </div>
      <div className={styles.screen}>
        <JsonCode jsonText={jsonText} label={`Board as ${jsonFormat} JSON`} />
      </div>
      <div className={styles.buttons}>
        <Button icon="copy" onClick={copyJson}>
          Copy
        </Button>
        <Button variant="primary" icon="download" onClick={downloadJson}>
          Download
        </Button>
      </div>
    </div>
  );
}

export default JsonExport;
