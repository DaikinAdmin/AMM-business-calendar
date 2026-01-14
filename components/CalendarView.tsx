'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer, View, SlotInfo } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/uk';
import { useSession } from 'next-auth/react';
import { Plus } from 'lucide-react';
import CreateEventModal from './CreateEventModal';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

moment.locale('uk');
const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  resource?: any;
}

export default function CalendarView() {
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<SlotInfo | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          color: event.priority === 'high' ? '#ef4444' : event.priority === 'urgent' ? '#dc2626' : '#3b82f6',
          resource: {
            projectId: event.projectId,
            type: event.type,
            description: event.description,
            createdById: event.createdById,
          },
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Drag and drop handler
  const handleEventDrop = useCallback(
    async ({ event, start, end }: any) => {
      // Check permissions
      const canEdit =
        session?.user.role === 'admin' ||
        session?.user.role === 'manager' ||
        event.resource.createdById === parseInt(session?.user.id || '0');

      if (!canEdit) {
        alert('У вас немає прав для редагування цієї події');
        return;
      }

      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          }),
        });

        if (response.ok) {
          // Update local state
          setEvents((prevEvents) =>
            prevEvents.map((evt) =>
              evt.id === event.id ? { ...evt, start, end } : evt
            )
          );
        } else {
          alert('Не вдалося оновити подію');
        }
      } catch (error) {
        console.error('Error updating event:', error);
        alert('Помилка при оновленні події');
      }
    },
    [session]
  );

  // Resize event handler
  const handleEventResize = useCallback(
    async ({ event, start, end }: any) => {
      const canEdit =
        session?.user.role === 'admin' ||
        session?.user.role === 'manager' ||
        event.resource.createdById === parseInt(session?.user.id || '0');

      if (!canEdit) {
        alert('У вас немає прав для редагування цієї події');
        return;
      }

      try {
        const response = await fetch(`/api/events/${event.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startTime: start.toISOString(),
            endTime: end.toISOString(),
          }),
        });

        if (response.ok) {
          setEvents((prevEvents) =>
            prevEvents.map((evt) =>
              evt.id === event.id ? { ...evt, start, end } : evt
            )
          );
        }
      } catch (error) {
        console.error('Error resizing event:', error);
      }
    },
    [session]
  );

  // Select slot handler
  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedSlot(slotInfo);
    setShowEventModal(true);
  };

  // Handle event click
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    if (typeof window !== 'undefined') {
      window.location.href = `/events/${event.id}`;
    }
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

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Календар подій</h2>
          <p className="text-gray-600 mt-1">Перегляд та управління зустрічами</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Створити подію
        </button>
      </div>

      <div style={{ height: 'calc(100vh - 250px)' }}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          date={date}
          onNavigate={setDate}
          eventPropGetter={eventStyleGetter}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          resizable
          selectable
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
            showMore: (total: number) => `+${total} ще`,
          }}
          popup
        />
      </div>

      <CreateEventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setSelectedSlot(null);
        }}
        onEventCreated={fetchEvents}
        initialStartTime={selectedSlot?.start}
        initialEndTime={selectedSlot?.end}
      />
    </div>
  );
}
