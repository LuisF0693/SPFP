import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Pencil, Check, Loader2 } from 'lucide-react';

export interface InlineEditProps {
  value: number;
  onSave: (value: number) => void | Promise<void>;
  format?: 'currency' | 'percent' | 'number' | 'integer';
  currency?: string;
  prefix?: string;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  valueClassName?: string;
  debounceMs?: number;
  /** Aria label for accessibility */
  ariaLabel?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  format = 'currency',
  currency = 'BRL',
  prefix = '',
  suffix = '',
  min,
  max,
  step = format === 'percent' ? 0.1 : 1,
  disabled = false,
  className = '',
  valueClassName = '',
  debounceMs = 500,
  ariaLabel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Update edit value when prop changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // Format display value
  const formatDisplayValue = useCallback(
    (val: number): string => {
      switch (format) {
        case 'currency':
          return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency,
          }).format(val);
        case 'percent':
          return `${val.toFixed(1)}%`;
        case 'integer':
          return val.toFixed(0);
        case 'number':
        default:
          return val.toLocaleString('pt-BR');
      }
    },
    [format, currency]
  );

  // Handle save with debounce
  const handleSave = useCallback(
    async (newValue: number) => {
      // Validate
      if (min !== undefined && newValue < min) newValue = min;
      if (max !== undefined && newValue > max) newValue = max;

      if (newValue === value) {
        setIsEditing(false);
        return;
      }

      setIsSaving(true);
      try {
        await onSave(newValue);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } catch (error) {
        console.error('Failed to save:', error);
        setEditValue(value); // Revert on error
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    },
    [value, onSave, min, max]
  );

  // Handle blur
  const handleBlur = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    handleSave(editValue);
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      handleSave(editValue);
    } else if (e.key === 'Escape') {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  // Handle change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value) || 0;
    setEditValue(newValue);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  if (disabled) {
    return (
      <span className={`${valueClassName}`}>
        {prefix}{formatDisplayValue(value)}{suffix}
      </span>
    );
  }

  if (isEditing) {
    return (
      <div className={`inline-flex items-center gap-1 ${className}`}>
        {prefix && <span className="text-[#637588] dark:text-[#92a4c9]">{prefix}</span>}
        <input
          ref={inputRef}
          type="number"
          value={editValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          aria-label={ariaLabel || 'Editar valor'}
          className="
            bg-transparent border-b-2 border-[#135bec] outline-none
            text-[#111418] dark:text-white font-bold
            w-24 px-1 py-0.5
            [appearance:textfield]
            [&::-webkit-outer-spin-button]:appearance-none
            [&::-webkit-inner-spin-button]:appearance-none
          "
        />
        {suffix && <span className="text-[#637588] dark:text-[#92a4c9]">{suffix}</span>}
        {isSaving && <Loader2 className="w-4 h-4 text-[#135bec] animate-spin" />}
      </div>
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`
        inline-flex items-center gap-1 cursor-pointer
        hover:bg-[#135bec]/10 px-2 py-1 rounded transition-colors
        group
        ${className}
      `}
    >
      <span className={`font-bold ${valueClassName}`}>
        {prefix}{formatDisplayValue(value)}{suffix}
      </span>

      {showSuccess ? (
        <Check className="w-4 h-4 text-green-500 animate-pulse" />
      ) : (
        <Pencil className="w-3 h-3 text-[#637588] dark:text-[#92a4c9] opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </span>
  );
};

export default InlineEdit;
