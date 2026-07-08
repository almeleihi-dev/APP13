import React, { createContext, useContext } from "react";

const ListSectionContext = createContext(false);

export function ListSectionProvider({ children }: { children: React.ReactNode }) {
  return <ListSectionContext.Provider value={true}>{children}</ListSectionContext.Provider>;
}

export function useListSectionContext(): boolean {
  return useContext(ListSectionContext);
}

export function useCardRoleInList(defaultRole: string): string {
  const inList = useListSectionContext();
  if (inList && (defaultRole === "article" || defaultRole === "group")) {
    return "listitem";
  }
  return defaultRole;
}
