import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, isWeekend, isSameDay } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type EnhancedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  holidays?: Date[];
  highlightWeekends?: boolean;
  highlightHolidays?: boolean;
};

function EnhancedCalendar({ 
  className, 
  classNames, 
  showOutsideDays = true,
  holidays = [],
  highlightWeekends = true,
  highlightHolidays = true,
  ...props 
}: EnhancedCalendarProps) {
  
  // Modifiers for weekends and holidays
  const modifiers = {
    weekend: highlightWeekends ? (date: Date) => isWeekend(date) : undefined,
    holiday: highlightHolidays ? (date: Date) => 
      holidays.some(holiday => isSameDay(date, holiday)) : undefined,
  };

  // Custom styles for modifiers
  const modifiersStyles = {
    weekend: {
      backgroundColor: 'hsl(var(--warning) / 0.1)',
      color: 'hsl(var(--warning))',
      fontWeight: '500',
      borderRadius: '0.375rem',
    },
    holiday: {
      backgroundColor: 'hsl(var(--destructive) / 0.1)',
      color: 'hsl(var(--destructive))',
      fontWeight: '500',
      borderRadius: '0.375rem',
    },
  };

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-card border border-border rounded-lg shadow-sm", className)}
      modifiers={modifiers}
      modifiersStyles={modifiersStyles}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-1",
        caption_label: "text-sm font-semibold text-foreground font-['Inter']",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-card border-border text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-medium text-[0.8rem] font-['Inter'] py-1",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative font-['Inter'] [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }), 
          "h-9 w-9 p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md aria-selected:opacity-100 font-['Inter'] relative"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold border border-primary/20 shadow-sm",
        day_today: "bg-accent text-accent-foreground font-semibold border border-border/50",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30 font-['Inter']",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed font-['Inter']",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4 text-foreground" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4 text-foreground" />,
        Day: ({ date, modifiers, ...dayProps }) => {
          const isWeekendDay = highlightWeekends && isWeekend(date);
          const isHoliday = highlightHolidays && holidays.some(holiday => isSameDay(date, holiday));
          
          let dayClassName = "h-9 w-9 p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md font-['Inter'] relative";
          
          if (isWeekendDay && !isHoliday) {
            dayClassName += " bg-warning/10 text-warning font-medium";
          } else if (isHoliday) {
            dayClassName += " bg-destructive/10 text-destructive font-medium";
          }
          
          if (modifiers.selected) {
            dayClassName += " bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-semibold border border-primary/20 shadow-sm";
          } else if (modifiers.today) {
            dayClassName += " bg-accent text-accent-foreground font-semibold border border-border/50";
          }
          
          return (
            <button
              {...dayProps}
              className={dayClassName}
              aria-label={format(date, 'PPP')}
            >
              {format(date, 'd')}
              {isHoliday && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-destructive rounded-full" />
              )}
            </button>
          );
        },
      }}
      {...props}
    />
  );
}

EnhancedCalendar.displayName = "EnhancedCalendar";

export { EnhancedCalendar };
