'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TabItem {
  id: string;
  label: string;
}

interface SlideTabsProps {
  tabs: TabItem[];
  activeId?: string;
  onChange?: (id: string) => void;
}

export const SlideTabs: React.FC<SlideTabsProps> = ({ tabs, activeId, onChange }) => {
  const [selected, setSelected] = useState(0);
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (activeId) {
      const idx = tabs.findIndex((t) => t.id === activeId);
      if (idx !== -1) setSelected(idx);
    }
  }, [activeId, tabs]);

  useEffect(() => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  }, [selected, tabs]);

  return (
    <ul
      onMouseLeave={() => {
        const selectedTab = tabsRef.current[selected];
        if (selectedTab) {
          const { width } = selectedTab.getBoundingClientRect();
          setPosition({
            left: selectedTab.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className="relative mx-auto flex w-fit rounded-full border border-slate-300 dark:border-slate-800 bg-slate-100/90 dark:bg-slate-900/90 p-1.5 backdrop-blur-md shadow-sm"
    >
      {tabs.map((tab, i) => (
        <Tab
          key={tab.id}
          ref={(el) => {
            tabsRef.current[i] = el;
          }}
          setPosition={setPosition}
          onClick={() => {
            setSelected(i);
            if (onChange) onChange(tab.id);
          }}
          isSelected={selected === i}
        >
          {tab.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

const Tab = React.forwardRef<
  HTMLLIElement,
  {
    children: React.ReactNode;
    setPosition: (pos: { left: number; width: number; opacity: number }) => void;
    onClick: () => void;
    isSelected: boolean;
  }
>(({ children, setPosition, onClick, isSelected }, ref) => {
  return (
    <li
      ref={ref}
      onClick={onClick}
      onMouseEnter={(e) => {
        const target = e.currentTarget;
        if (target) {
          const { width } = target.getBoundingClientRect();
          setPosition({
            left: target.offsetLeft,
            width,
            opacity: 1,
          });
        }
      }}
      className={`relative z-10 block cursor-pointer px-4 py-2 text-xs md:text-sm font-extrabold transition-colors duration-200 select-none ${
        isSelected
          ? 'text-black dark:text-black font-black'
          : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
      }`}
    >
      {children}
    </li>
  );
});

Tab.displayName = 'Tab';

const Cursor = ({ position }: { position: { left: number; width: number; opacity: number } }) => {
  return (
    <motion.li
      animate={{
        ...position,
      }}
      transition={{ type: 'spring', stiffness: 450, damping: 35 }}
      className="absolute z-0 h-8 rounded-full bg-cyan-electric shadow-cyan-glow md:h-9"
    />
  );
};
