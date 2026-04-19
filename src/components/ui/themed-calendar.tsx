import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { isWeekend } from "date-fns";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type ThemedCalendarProps = React.ComponentProps<typeof DayPicker> & {
  highlightWeekends?: boolean;
};

function ThemedCalendar({ 
  className, 
  classNames, 
  showOutsideDays = true,
  highlightWeekends = true,
  ...props 
}: ThemedCalendarProps) {
  
  // Custom day component to handle weekend highlighting
  const DayComponent = ({ date, ...dayProps }: any) => {
    const isWeekendDay = highlightWeekends && isWeekend(date);
    const weekendClass = isWeekendDay ? "bg-warning/10 text-warning font-medium" : "";
    
    return (
      <button
        {...dayProps}
        className={cn(
          "h-9 w-9 p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md font-['Inter'] relative",
          weekendClass,
          dayProps.className
        )}
      >
        {date.getDate()}
      </button>
    );
  };

  return (
    <div className="rdp">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 bg-card border border-border rounded-lg shadow-sm", className)}
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
          day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal text-foreground hover:bg-accent hover:text-accent-foreground transition-colors rounded-md aria-selected:opacity-100 font-['Inter']"),
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
          Day: highlightWeekends ? DayComponent : undefined,
        }}
        {...props}
      />
    </div>
  );
}

ThemedCalendar.displayName = "ThemedCalendar";

export { ThemedCalendar };
