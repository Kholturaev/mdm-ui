import { forwardRef, useState } from 'react';
import { Input } from './Input';
import type { InputProps } from './Input';
import { EyeIcon, EyeOffIcon } from '../icons/EyeIcon';

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<InputProps, 'type' | 'rightIcon'>
>(function PasswordInput(props, ref) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={visible ? 'text' : 'password'}
      rightIcon={
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setVisible((v) => !v)}
          className="hover:text-fg"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
    />
  );
});
