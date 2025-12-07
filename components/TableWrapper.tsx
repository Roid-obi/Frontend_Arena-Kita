"use client";

import React from "react";

interface TableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export default function TableWrapper({ children, className = "" }: TableWrapperProps) {
  return (
    <div className={`overflow-x-auto bg-white border rounded ${className}`}>
      {children}
    </div>
  );
}
