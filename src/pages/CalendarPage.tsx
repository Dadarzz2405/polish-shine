import { useState, useEffect } from 'react';
import api from '@/services/api';
import { CalendarEvent } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Moon, Loader2 } from 'lucide-react';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [hijriDate, setHijriDate] = useState('');
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    loadData();
  }, [month, year]);

  async function loadData() {
    setLoading(true);
    try {
      const [eventsData, hijriData] = await Promise.all([
        api.get<{ events: CalendarEvent[] }>(`/api/calendar?month=${month + 1}&year=${year}`),
        api.get<{ hijri: string }>('/api/hijri'),
      ]);
      setEvents(eventsData.events || []);
      setHijriDate(hijriData.hijri || '');
    } catch (error) {
      console.error('Failed to load calendar:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calendar calculations
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  // Build calendar grid
  const days = [];
  
  // Previous month
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: prevMonthDays - i, current: false });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true });
  }
  
  // Next month
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false });
  }

  function getEventsForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  }

  function isToday(day: number) {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        {hijriDate && (
          <Badge variant="secondary" className="text-sm">
            <Moon className="h-3 w-3 mr-1" />{hijriDate}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <CardTitle className="min-w-[200px] text-center">
                {MONTHS[month]} {year}
              </CardTitle>
              <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="outline" onClick={() => setCurrentDate(new Date())}>Today</Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-px mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-sm font-medium text-muted-foreground py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {days.map((d, i) => {
              const dayEvents = d.current ? getEventsForDay(d.day) : [];
              return (
                <div
                  key={i}
                  className={`min-h-[80px] p-2 bg-card ${!d.current ? 'bg-muted/50' : ''}`}
                >
                  <div className={`text-sm mb-1 ${
                    !d.current ? 'text-muted-foreground/50' :
                    isToday(d.day) ? 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center' :
                    ''
                  }`}>
                    {d.day}
                  </div>
                  {dayEvents.slice(0, 2).map(e => (
                    <div
                      key={e.id}
                      className={`text-xs px-1 py-0.5 rounded truncate mb-1 ${
                        e.type === 'session' ? 'bg-primary/10 text-primary' : 'bg-accent text-accent-foreground'
                      }`}
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-muted-foreground">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex gap-4 text-sm">
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
