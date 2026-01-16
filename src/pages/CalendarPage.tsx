import { useState, useEffect } from 'react';
import { calendarApi } from '@/services/api';
import { CalendarEvent } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Moon, Loader2 } from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hijriDate, setHijriDate] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, hijriData] = await Promise.all([
          calendarApi.getEvents(month + 1, year),
          calendarApi.getHijriDate(),
        ]);
        setEvents((eventsData as any).events || []);
        setHijriDate((hijriData as any).hijri || '');
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [month, year]);

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Generate calendar grid
  const calendarDays = [];
  
  // Previous month's days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      events: [],
    });
  }

  // Current month's days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      events: getEventsForDay(i),
    });
  }

  // Next month's days
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      events: [],
    });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
          <p className="text-muted-foreground mt-2">
            View sessions and Islamic events
          </p>
        </div>
        {hijriDate && (
          <Badge variant="secondary" className="text-sm">
            <Moon className="h-3 w-3 mr-1" />
            {hijriDate}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="min-w-[200px] text-center">
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={goToToday}>
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Days header */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {calendarDays.map((dayInfo, index) => (
              <div
                key={index}
                className={`min-h-[100px] p-2 bg-card ${
                  !dayInfo.isCurrentMonth ? 'bg-muted/50' : ''
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    !dayInfo.isCurrentMonth
                      ? 'text-muted-foreground/50'
                      : isToday(dayInfo.day)
                      ? 'bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center'
                      : 'text-foreground'
                  }`}
                >
                  {dayInfo.day}
                </div>
                <div className="space-y-1">
                  {dayInfo.events.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      className={`text-xs px-1 py-0.5 rounded truncate ${
                        event.type === 'session'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      {event.title}
                    </div>
                  ))}
                  {dayInfo.events.length > 2 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayInfo.events.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-primary/10" />
          <span className="text-muted-foreground">Sessions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent" />
          <span className="text-muted-foreground">Islamic Holidays</span>
        </div>
      </div>
    </div>
  );
}
