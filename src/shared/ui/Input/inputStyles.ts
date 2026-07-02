import type { ControlSize } from '../types';

/** Shared frame classes for every text-like control (Input, Textarea, PhoneField, Select trigger, DatePicker). */
export const INPUT_SIZE_CLASSES: Record<ControlSize, string> = {
  sm: 'h-8 px-2.5 text-xs rounded',
  md: 'h-9 px-3 text-sm rounded',
  lg: 'h-11 px-4 text-base rounded',
};

export const INPUT_FRAME_CLASSES =
  'w-full border bg-surface text-fg placeholder:text-fg-muted outline-none transition-colors ' +
  'border-border focus:border-primary focus:ring-primary/20 focus:ring-2 ' +
  'disabled:bg-disabled-bg disabled:text-disabled-fg disabled:cursor-not-allowed';

export const INPUT_ERROR_CLASSES =
  'border-danger focus:border-danger focus:ring-danger/20';
