import React, { createContext, useState, useContext, ReactNode } from 'react';

interface UserContextType {
  myInfo: { studentId: string; name: string; major?: string } | null;
  setMyInfo: (info: { studentId: string; name: string; major?: string } | null) => void;
  hasUnreadMessage: boolean;
  setHasUnreadMessage: (hasUnread: boolean) => void;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [myInfo, setMyInfo] = useState<{ studentId: string; name: string; major?: string } | null>(null);
  const [hasUnreadMessage, setHasUnreadMessage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  return (
    <UserContext.Provider value={{ myInfo, setMyInfo, hasUnreadMessage, setHasUnreadMessage, isAdmin, setIsAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
