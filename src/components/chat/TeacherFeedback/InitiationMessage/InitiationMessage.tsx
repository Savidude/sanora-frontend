import React from 'react';
import { InitiationMessageData } from '../../../../types/chat';
import { WordTipsComponent } from '../WordTipsComponent';
import { renderMarkdown } from '../../../../utils/markdown';
import styles from './InitiationMessage.module.css';

export interface InitiationMessageProps {
  data: InitiationMessageData;
  timestamp: Date;
  isMobile: boolean;
}

export const InitiationMessage: React.FC<InitiationMessageProps> = ({
  data,
  isMobile
}) => {
  return (
    <div className={`${styles.container} ${isMobile ? styles.mobile : styles.desktop}`}>
      
      {/* Greeting Section */}
      <section className={styles.greetingSection} aria-label="Greeting">
        <h3 className={styles.sectionTitle}>Greeting</h3>
        {data.greeting ? (
          <p className={styles.greetingText} lang="fi">{renderMarkdown(data.greeting)}</p>
        ) : (
          <span className={styles.fallback}>No data</span>
        )}
      </section>

      {/* Scenario Section */}
      <section className={styles.scenarioSection} aria-label="Scenario">
        <h3 className={styles.sectionTitle}>Scenario</h3>
        {data.scenario ? (
          <p className={styles.scenarioText}>{renderMarkdown(data.scenario)}</p>
        ) : (
          <span className={styles.fallback}>No data</span>
        )}
      </section>

      {/* Initial Prompt Section */}
      <section className={styles.promptSection} aria-label="Let's Practice">
        <h3 className={styles.sectionTitle}>Let's Practice</h3>
        {data.conversationContinuation ? (
          <div className={styles.promptText}>{renderMarkdown(data.conversationContinuation)}</div>
        ) : (
          <span className={styles.fallback}>No data</span>
        )}
      </section>

      {/* Word Tips Section */}
      <WordTipsComponent 
        tips={data.wordTips || []}
        layout="card"
        maxVisible={6}
      />
      
    </div>
  );
};
