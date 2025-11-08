import React, { useState, useCallback } from 'react';
import { HamburgerMenu } from './HamburgerMenu';
import { useHamburgerMenu } from '../../hooks/useHamburgerMenu';
import { useChat } from '../../hooks/useChat';
import { MenuItem } from '../../types/menu';
import { conversationUtils } from '../../utils/conversationUtils';
import styles from './ChatLayout.module.css';

export interface ChatLayoutProps {
  children: React.ReactNode;
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({ children }) => {
  const menuState = useHamburgerMenu();
  const { resetConversation } = useChat();
  const [resetError, setResetError] = useState<string | null>(null);

  const handleNewConversation = useCallback(async () => {
    try {
      setResetError(null);
      await resetConversation();
      // Menu will close automatically after successful reset (page reload)
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to reset conversation');
      const errorInfo = conversationUtils.handleConversationError(err, handleNewConversation);
      setResetError(errorInfo.message);
      // Keep menu open to show error and retry option
    }
  }, [resetConversation]);

  // Menu items configuration with "Start New Conversation"
  const menuItems: MenuItem[] = [
    {
      id: 'new-conversation',
      label: 'Start New Conversation',
      onClick: handleNewConversation,
      variant: 'danger',
    },
  ];

  return (
    <div className={styles.layout}>
      <div ref={menuState.menuRef}>
        <HamburgerMenu
          isOpen={menuState.isOpen}
          onToggle={menuState.toggle}
          onClose={menuState.close}
          items={menuItems}
        />
      </div>
      {resetError && (
        <div className={styles.errorBanner}>
          <p>{resetError}</p>
          <button onClick={() => setResetError(null)}>Dismiss</button>
        </div>
      )}
      <header className={styles.header}>
        <h1 className={styles.title}>Sanora</h1>
        <p className={styles.subtitle}>Finnish Language Tutor</p>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
};
