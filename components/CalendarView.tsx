'use client';

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/uk';
import { useState, useMemo } from 'react';
import { getMeetings, getProjects } from '@/lib/utils';
import { CalendarEvent } from '@/types';

moment.locale('uk');
const localizer = momentLocalizer(moment);

export default function CalendarView() {
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');
  const [date, setDate] = useState(new Date());

  const events = useMemo(() => {
    const meetings = getMeetings();
    return meetings.map(meeting => ({
      ...meeting,
      resource: {
        projectId: meeting.projectId,
        type: meeting.type,
      },
    })) as CalendarEvent[];
  }, []);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = event.color || '#3b82f6';
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Календар подій</h2>
        <p className="text-gray-600 mt-1">Перегляд зустрічей та дедлайнів</p>
      </div>

      <div style={{ height: 'calc(100vh - 250px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          messages={{
            next: 'Далі',
            previous: 'Назад',
            today: 'Сьогодні',
            month: 'Місяць',
            week: 'Тиждень',
            day: 'День',
            agenda: 'Порядок денний',
            date: 'Дата',
            time: 'Час',
            event: 'Подія',
            noEventsInRange: 'Немає подій у цьому діапазоні.',
            showMore: (total) => `+${total} ще`,
          }}
          popup
          selectable
        />
      </div>
    </div>
  );
}
