
'use client';

import { useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BirthdayPickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  disabled?: boolean;
}

const months = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' },
];

export function BirthdayPicker({ value, onChange, disabled }: BirthdayPickerProps) {
  const [day, setDay] = useState<string>(value ? String(value.getDate()) : '');
  const [month, setMonth] = useState<string>(value ? String(value.getMonth()) : '');
  const [year, setYear] = useState<string>(value ? String(value.getFullYear()) : '');

  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);
  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

  useEffect(() => {
    if (day && month && year) {
      const selectedDay = parseInt(day, 10);
      const selectedMonth = parseInt(month, 10);
      const selectedYear = parseInt(year, 10);

      const maxDays = daysInMonth(selectedMonth, selectedYear);
      if (selectedDay > maxDays) {
        setDay(String(maxDays)); // Adjust day if it's invalid for the selected month/year
        return;
      }
      
      const newDate = new Date(selectedYear, selectedMonth, selectedDay);
      onChange(newDate);
    }
  }, [day, month, year, onChange]);

  const numDays = month !== '' && year !== '' ? daysInMonth(parseInt(month), parseInt(year)) : 31;

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select value={month} onValueChange={setMonth} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m) => (
            <SelectItem key={m.value} value={String(m.value)}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={day} onValueChange={setDay} disabled={disabled || month === '' || year === ''}>
        <SelectTrigger>
          <SelectValue placeholder="Day" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: numDays }, (_, i) => i + 1).map((d) => (
            <SelectItem key={d} value={String(d)}>
              {d}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={year} onValueChange={setYear} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder="Year" />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
