import React, { useState, useEffect, useRef } from 'react';
import { HamburgerMenuProps } from '../../types/menu';
import styles from './HamburgerMenu.module.css';

type AnimationState = 'closed' | 'opening' | 'open' | 'closing';

/**
 * HamburgerMenu Component
 * Provides hamburger menu navigation with slide-out panel for chat application actions
 */
export const HamburgerMenu: React.FC<HamburgerMenuProps> = ({
  isOpen,
  onToggle,
  onClose,
  items,
  className,
  'data-testid': dataTestId,
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>('closed');
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  // Handle animation states when isOpen changes
  useEffect(() => {
    if (isOpen) {
      setAnimationState('opening');
      // Focus first menu item when menu opens
      setTimeout(() => {
        setAnimationState('open');
        if (menuPanelRef.current) {
          const firstButton = menuPanelRef.current.querySelector('button');
          firstButton?.focus();
        }
      }, 50);
    } else {
      if (animationState === 'open' || animationState === 'opening') {
        setAnimationState('closing');
        setTimeout(() => {
          setAnimationState('closed');
        }, 300);
      }
    }
  }, [isOpen, animationState]);

  const handleItemClick = async (item: { id: string; onClick: () => void; disabled?: boolean }) => {
    if (item.disabled) return;
    
    try {
      setLoadingItemId(item.id);
      await item.onClick();
      onClose();
    } catch (error) {
      // Error is handled by parent component
      console.error('Menu item action failed:', error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const showMenu = animationState !== 'closed';

  return (
    <div className={`${styles.hamburgerMenu} ${className || ''}`} data-testid={dataTestId}>
      {/* Hamburger icon with 3 horizontal lines */}
      <button 
        className={styles.menuIcon} 
        onClick={onToggle}
        aria-label="Open menu"
        aria-expanded={isOpen}
        aria-haspopup="true"
        type="button"
      >
        <div className={styles.iconBar}></div>
        <div className={styles.iconBar}></div>
        <div className={styles.iconBar}></div>
      </button>

      {/* Background overlay when menu is open */}
      {showMenu && (
        <div 
          className={styles.overlay}
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Slide-out menu panel with animation states */}
      {showMenu && (
        <div 
          ref={menuPanelRef}
          className={`${styles.menuPanel} ${
            animationState === 'opening' ? styles.menuPanelOpening : ''
          } ${
            animationState === 'closing' ? styles.menuPanelClosing : ''
          }`}
          role="menu"
          aria-label="Navigation menu"
        >
          {/* Render menu items from items prop array */}
          {items.map(item => {
            const isLoading = loadingItemId === item.id;
            const itemClassName = `${styles.menuItem} ${
              item.variant === 'danger' ? styles.menuItemDanger : ''
            }`;
            
            return (
              <button
                key={item.id}
                className={itemClassName}
                onClick={() => handleItemClick(item)}
                disabled={item.disabled || isLoading}
                role="menuitem"
                aria-label={item.label}
                type="button"
              >
                {item.icon && !isLoading && (
                  <span className={styles.menuItemIcon}>{item.icon}</span>
                )}
                {isLoading && (
                  <span className={styles.menuItemIcon}>
                    <span className={styles.loadingSpinner}>⏳</span>
                  </span>
                )}
                <span className={styles.menuItemLabel}>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
