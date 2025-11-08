import React from 'react';
import styles from './ChatLayout.module.css';

export interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <h1 className={styles.title}>Sanora</h1>
        <p className={styles.subtitle}>Finnish Language Tutor</p>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};
