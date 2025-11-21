import { useState, useEffect } from 'react';

/**
 * Custom hook for managing localStorage with automatic serialization/deserialization
 * @param key - localStorage key
 * @param initialValue - default value if key doesn't exist
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      // Use the callback form of setState to ensure we get the latest value
      setStoredValue((currentValue) => {
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        // Save to local storage
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
          console.error(`Error saving to localStorage key "${key}":`, error);
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error in setValue for localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  // Method to remove the item from localStorage
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

/**
 * Hook for secure session data storage
 * Adds expiration and validation for sensitive session data
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T,
  expirationMinutes: number = 60
) {
  const wrappedKey = `secure_${key}`;
  
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(wrappedKey);
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      
      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        window.localStorage.removeItem(wrappedKey);
        return initialValue;
      }
      
      return parsed.value as T;
    } catch (error) {
      console.error(`Error loading secure storage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((currentValue) => {
        const valueToStore = value instanceof Function ? value(currentValue) : value;
        
        const expiresAt = Date.now() + expirationMinutes * 60 * 1000;
        const wrapped = {
          value: valueToStore,
          expiresAt,
          createdAt: Date.now(),
        };
        
        try {
          window.localStorage.setItem(wrappedKey, JSON.stringify(wrapped));
        } catch (error) {
          console.error(`Error saving secure storage key "${key}":`, error);
        }
        
        return valueToStore;
      });
    } catch (error) {
      console.error(`Error in setValue for secure storage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      window.localStorage.removeItem(wrappedKey);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing secure storage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}
