import React from "react";

const SeoCalculatorContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="mx-auto max-w-5xl px-4 mb-16">
    <div className="min-h-[70vh]">
      {children}
    </div>
  </div>
);

export default SeoCalculatorContainer;
