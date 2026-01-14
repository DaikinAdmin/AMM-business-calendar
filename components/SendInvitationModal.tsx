'use client';

import React, { useState, useEffect } from 'react';
import { X, Send, Users, Calendar, FileText } from 'lucide-react';

interface SendInvitationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvitationSent: () => void;
  eventId?: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
}

export default function SendInvitationModal({
  isOpen,
  onClose,
  onInvitationSent,
  eventId,
}: SendInvitationModalProps) {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [formData, setFormData] = useState({
    eventId: eventId || 0,
    recipientId: 0,
    message: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchEmployees();
      if (!eventId) {
        fetchEvents();
      } else {
        setFormData(prev => ({ ...prev, eventId }));
      }
    }
  }, [isOpen, eventId]);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.eventId || !formData.recipientId) {
      alert('Будь ласка, оберіть подію та отримувача');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onInvitationSent();
        onClose();
        resetForm();
      } else {
        const error = await response.json();
        alert(error.error || 'Помилка при надсиланні запрошення');
      }
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('Помилка при надсиланні запрошення');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      eventId: eventId || 0,
      recipientId: 0,
      message: '',
    });
  };

  const selectedEvent = events.find(e => e.id === formData.eventId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Надіслати запрошення</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Event Selection (if not pre-selected) */}
          {!eventId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Подія *
              </label>
              <select
                required
                value={formData.eventId}
                onChange={(e) => setFormData({ ...formData, eventId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Оберіть подію</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} - {new Date(event.startTime).toLocaleString('uk-UA')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Event Info (if pre-selected) */}
          {eventId && selectedEvent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Подія:</p>
              <p className="text-lg font-semibold text-blue-900">{selectedEvent.title}</p>
              <p className="text-sm text-blue-700 mt-1">
                {new Date(selectedEvent.startTime).toLocaleString('uk-UA')}
              </p>
            </div>
          )}

          {/* Recipient Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-2" />
              Отримувач *
            </label>
            <select
              required
              value={formData.recipientId}
              onChange={(e) => setFormData({ ...formData, recipientId: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={0}>Оберіть працівника</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} ({employee.email})
                </option>
              ))}
            </select>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Повідомлення (необов'язково)
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              placeholder="Додайте особисте повідомлення до запрошення..."
            />
          </div>

          {/* Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Отримувач отримає запрошення на участь у події. Після прийняття він автоматично буде доданий до списку учасників.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              <Send className="w-5 h-5" />
              {loading ? 'Надсилання...' : 'Надіслати запрошення'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
