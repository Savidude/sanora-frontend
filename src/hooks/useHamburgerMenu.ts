import { useState, useRef, useEffect, RefObject, useCallback } from 'react';

/**
 * Return type for useHamburgerMenu hook
 */
export interface UseHamburgerMenuReturn {
  /** Current menu open state */
  isOpen: boolean;
  
  /** Toggle menu open/closed */
  toggle: () => void;
  
  /** Close menu */
  close: () => void;
  
  /** Open menu */
  open: () => void;
  
  /** Ref for menu container (for outside click detection) */
  menuRef: RefObject<HTMLDivElement>;
}

/**
 * Custom hook for managing hamburger menu state and behavior
 * Handles menu open/close state, outside click detection, and keyboard interactions
 */
export const useHamburgerMenu = (): UseHamburgerMenuReturn => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Focus management - store previous focus and restore on close
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else {
      // Restore focus when menu closes
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
        previousActiveElement.current = null;
      }
    }
  }, [isOpen]);

  // Outside click detection
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        close();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  // Escape key handler
  useEffect(() => {
    if (!isOpen) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, close]);

  return {
    isOpen,
    toggle,
    close,
    open,
    menuRef,
  };
};
