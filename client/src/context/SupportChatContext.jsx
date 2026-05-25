import { createContext, useContext, useState, useCallback } from 'react';

const SupportChatContext = createContext(null);

export const SupportChatProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <SupportChatContext.Provider value={{ isOpen, openChat, closeChat, toggleChat }}>
      {children}
    </SupportChatContext.Provider>
  );
};

export const useSupportChat = () => {
  const ctx = useContext(SupportChatContext);
  if (!ctx) {
    throw new Error('useSupportChat must be used within SupportChatProvider');
  }
  return ctx;
};
