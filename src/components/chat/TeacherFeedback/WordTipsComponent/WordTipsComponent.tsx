import React, { useState } from 'react';
import { WordTip } from '../../../../types/chat';
import styles from './WordTipsComponent.module.css';

export interface WordTipsProps {
  tips: WordTip[];
  layout?: 'card' | 'inline';
  maxVisible?: number;
}

export const WordTipsComponent: React.FC<WordTipsProps> = ({
  tips,
  layout = 'card',
  maxVisible = 6
}) => {
  const [showAll, setShowAll] = useState(false);
  const displayTips = showAll ? tips : tips.slice(0, maxVisible);

  if (!tips || tips.length === 0) {
    return (
      <section className={styles.wordTipsSection} aria-label="Word tips">
        <h3 className={styles.sectionTitle}>Word Tips</h3>
        <span className={styles.fallback}>No data</span>
      </section>
    );
  }

  return (
    <section className={styles.wordTipsSection} aria-label="Word tips">
      <h3 className={styles.sectionTitle}>Word Tips</h3>
      
      <div className={`${styles.tipsContainer} ${styles[layout]}`} role="list">
        {displayTips.map((tip, index) => (
          <div 
            key={index} 
            className={styles.tipCard}
            role="listitem"
            aria-label={`Finnish word: ${tip.finnish}, English translation: ${tip.english}`}
          >
            <div className={styles.finnishWord} lang="fi">{tip.finnish}</div>
            <div className={styles.englishTranslation} lang="en">{tip.english}</div>
          </div>
        ))}
      </div>

      {tips.length > maxVisible && (
        <button 
          className={styles.expandButton}
          onClick={() => setShowAll(!showAll)}
          aria-expanded={showAll}
          aria-label={showAll ? 'Show fewer word tips' : `Show all ${tips.length} word tips`}
        >
          {showAll ? 'Show Less' : `Show All (${tips.length})`}
        </button>
      )}
    </section>
  );
};
