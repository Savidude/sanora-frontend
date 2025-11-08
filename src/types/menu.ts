/**
 * Type definitions for hamburger menu component
 */

export interface MenuItem {
  /** Unique identifier for the menu item */
  id: string;
  
  /** Display label for the menu item */
  label: string;
  
  /** Click handler for the menu item */
  onClick: () => void;
  
  /** Optional icon component or icon name */
  icon?: React.ReactNode | string;
  
  /** Optional disabled state */
  disabled?: boolean;
  
  /** Optional variant for styling (e.g., 'danger' for destructive actions) */
  variant?: 'default' | 'danger';
}

export interface HamburgerMenuProps {
  /** Controls menu open/closed state */
  isOpen: boolean;
  
  /** Callback when menu toggle is requested (open/close) */
  onToggle: () => void;
  
  /** Callback when menu should be closed (outside click, item selection) */
  onClose: () => void;
  
  /** Menu items configuration */
  items: MenuItem[];
  
  /** Optional CSS class name for styling customization */
  className?: string;
  
  /** Optional test identifier for testing */
  'data-testid'?: string;
}
