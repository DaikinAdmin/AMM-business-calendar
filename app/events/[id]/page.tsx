'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, MapPin, Users, Clock, Edit2, Trash2, Send } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SendInvitationModal from '@/components/SendInvitationModal';

interface Event {
  id: number;
  title: string;
  description?: string;
  type: string;
  startTime: string;
  endTime: string;
  location?: string;
  priority: string;
  status: string;
  createdBy?: any;
  participants?: any[];
  project?: any;
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (params?.id) {
      fetchEvent(params.id as string);
    }
  }, [params]);

  const fetchEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvent(data);
      } else {
        router.push('/calendar');
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      router.push('/calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Ви впевнені, що хочете видалити цю подію?')) return;

    try {
      const response = await fetch(`/api/events/${event?.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/calendar');
      } else {
        alert('Не вдалося видалити подію');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Помилка при видаленні події');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const canEdit =
    session?.user.role === 'admin' ||
    session?.user.role === 'manager' ||
    event.createdBy?.id === parseInt(session?.user.id || '0');

  const typeLabels: Record<string, string> = {
    meeting: 'Зустріч',
    task: 'Завдання',
    reminder: 'Нагадування',
    vacation: 'Відпустка',
  };

  const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-orange-100 text-orange-800',
    high: 'bg-red-100 text-red-800',
    urgent: 'bg-red-200 text-red-900',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <Link
        href="/calendar"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до календаря
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h1>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {typeLabels[event.type] || event.type}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  priorityColors[event.priority] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {event.priority}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[event.status] || 'bg-gray-100 text-gray-800'
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Запросити
              </button>
              <button
                onClick={() => router.push(`/events/${event.id}/edit`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Опис</h3>
            <p className="text-gray-900">{event.description || 'Опис відсутній'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Початок</p>
                <p className="text-gray-900">{formatDateTime(event.startTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Кінець</p>
                <p className="text-gray-900">{formatDateTime(event.endTime)}</p>
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Місце</p>
                  <p className="text-gray-900">{event.location}</p>
                </div>
              </div>
            )}

            {event.createdBy && (
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Організатор</p>
                  <p className="text-gray-900">{event.createdBy.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {event.project && (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Пов'язаний проект</h3>
            <Link
              href={`/projects/${event.project.id}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {event.project.name}
            </Link>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Учасники ({event.participants?.length || 0})
          </h2>

          {event.participants && event.participants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {event.participants.map((participant: any) => (
                <div key={participant.id} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                    {participant.user?.name
                      ?.split(' ')
                      .map((n: string) => n[0])
                      .join('') || '?'}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{participant.user?.name}</p>
                    <p className="text-sm text-gray-600">{participant.status}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Немає учасників</p>
          )}
        </div>
      </div>

      <SendInvitationModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvitationSent={() => {
          setShowInviteModal(false);
          fetchEvent(params.id as string);
        }}
        eventId={event.id}
      />
    </div>
  );
}
