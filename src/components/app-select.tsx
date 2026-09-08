"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  items: { value: string; label: string }[];
  className?: string;
  id?: string;
};

export function AppSelect({
  value,
  onValueChange,
  placeholder,
  items,
  className,
  id,
}: Props) {
  const selectedLabel = items.find((item) => item.value === value)?.label;

  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (typeof next === "string") onValueChange(next);
      }}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "h-11 w-full min-w-0 rounded-2xl border-border/80 bg-card px-3.5 text-sm",
          className,
        )}
      >
        <SelectValue placeholder={placeholder}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent
        alignItemWithTrigger={false}
        align="start"
        className="min-w-48"
      >
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
