"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ContentFilterType } from "@/components/ContentFilterModal";

interface ContentFilterContextType {
  filter: ContentFilterType;
  setFilter: (filter: ContentFilterType) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
}

const ContentFilterContext = createContext<ContentFilterContextType | undefined>(undefined);

export const ContentFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filter, setFilter] = useState<ContentFilterType>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ContentFilterContext.Provider
      value={{
        filter,
        setFilter,
        isModalOpen,
        setIsModalOpen,
      }}
    >
      {children}
    </ContentFilterContext.Provider>
  );
};

export const useContentFilter = (): ContentFilterContextType => {
  const context = useContext(ContentFilterContext);
  if (!context) {
    throw new Error("useContentFilter must be used within a ContentFilterProvider");
  }
  return context;
};

