import { useMemo } from 'react';
import { tokenizeJson } from '@/lib/jsonTokens';
import styles from './JsonCode.module.scss';

export interface JsonCodeProps {
  jsonText: string;
  /** Names the code region for screen readers. */
  label: string;
}

/** JSON with neon syntax colours, rendered as plain text spans (no injected HTML). */
function JsonCode({ jsonText, label }: JsonCodeProps) {
  const tokens = useMemo(() => tokenizeJson(jsonText), [jsonText]);

  return (
    <pre className={styles.code} role="region" aria-label={label} tabIndex={0}>
      <code>
        {tokens.map((token, tokenIndex) =>
          token.kind === 'space' || token.kind === 'punctuation' ? (
            token.text
          ) : (
            <span key={tokenIndex} className={styles[token.kind]}>
              {token.text}
            </span>
          ),
        )}
      </code>
    </pre>
  );
}

export default JsonCode;
