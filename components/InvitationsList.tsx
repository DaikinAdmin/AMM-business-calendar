'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/uk';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import SendInvitationModal from './SendInvitationModal';

moment.locale('uk');

interface Invitation {
  id: number;
  status: string;
  message?: string;
  sentAt: string;
  respondedAt?: string;
  event: {
    id: number;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    type: string;
    location?: string;
    createdBy?: {
      name: string;
    };
    project?: {
      name: string;
    };
  };
  sentBy: {
    name: string;
    email: string;
  };
}

export default function InvitationsList() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations');
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (invitationId: number, status: 'accepted' | 'declined') => {
    setProcessingId(invitationId);
    
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setInvitations((prev) =>
          prev.map((inv) =>
            inv.id === invitationId
              ? { ...inv, status, respondedAt: new Date().toISOString() }
              : inv
          )
        );
      } else {
        alert('Не вдалося оновити запрошення');
      }
    } catch (error) {
      console.error('Error responding to invitation:', error);
      alert('Помилка при обробці запрошення');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredInvitations = invitations.filter((inv) => {
    if (filter === 'all') return true;
    return inv.status === filter;
  });

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-200',
    accepted: 'bg-green-50 border-green-200',
    declined: 'bg-red-50 border-red-200',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Очікує',
    accepted: 'Прийнято',
    declined: 'Відхилено',
  };

  const pendingCount = invitations.filter((inv) => inv.status === 'pending').length;
  const acceptedCount = invitations.filter((inv) => inv.status === 'accepted').length;
  const declinedCount = invitations.filter((inv) => inv.status === 'declined').length;

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Запрошення</h1>
          <p className="text-gray-600 mt-2">Перегляд запрошень на події</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Запрошення</h1>
          <p className="text-gray-600 mt-2">Перегляд та управління запрошеннями на події</p>
        </div>
        {(session?.user.role === 'admin' || session?.user.role === 'manager') && (
          <button
            onClick={() => setShowSendModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Надіслати запрошення
          </button>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Всього</p>
              <p className="text-2xl font-bold text-gray-900">{invitations.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Очікують</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Прийнято</p>
              <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Відхилено</p>
              <p className="text-2xl font-bold text-gray-900">{declinedCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Всі
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Очікують ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('accepted')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'accepted'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Прийнято
        </button>
        <button
          onClick={() => setFilter('declined')}
          className={`px-4 py-2 rounded-lg ${
            filter === 'declined'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Відхилено
        </button>
      </div>

      {/* Invitations List */}
      <div className="space-y-4">
        {filteredInvitations.length > 0 ? (
          filteredInvitations.map((invitation) => (
            <div
              key={invitation.id}
              className={`border-2 rounded-lg p-6 ${
                statusColors[invitation.status] || 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {invitation.event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Від: <span className="font-medium">{invitation.sentBy.name}</span>
                    </p>
                    {invitation.message && (
                      <p className="text-sm text-gray-700 mt-2 italic">&quot;{invitation.message}&quot;</p>
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    invitation.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : invitation.status === 'accepted'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {statusLabels[invitation.status]}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Початок</p>
                  <p className="text-gray-900">{moment(invitation.event.startTime).format('LLL')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Кінець</p>
                  <p className="text-gray-900">{moment(invitation.event.endTime).format('LLL')}</p>
                </div>
                {invitation.event.location && (
                  <div>
                    <p className="text-sm text-gray-500">Місце</p>
                    <p className="text-gray-900">{invitation.event.location}</p>
                  </div>
                )}
                {invitation.event.project && (
                  <div>
                    <p className="text-sm text-gray-500">Проект</p>
                    <p className="text-gray-900">{invitation.event.project.name}</p>
                  </div>
                )}
              </div>

              {invitation.event.description && (
                <p className="text-gray-700 mb-4">{invitation.event.description}</p>
              )}

              {invitation.status === 'pending' ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResponse(invitation.id, 'accepted')}
                    disabled={processingId === invitation.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Прийняти
                  </button>
                  <button
                    onClick={() => handleResponse(invitation.id, 'declined')}
                    disabled={processingId === invitation.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400"
                  >
                    <XCircle className="w-4 h-4" />
                    Відхилити
                  </button>
                  <Link
                    href={`/events/${invitation.event.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4" />
                    Деталі
                  </Link>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">
                    Відповідь надана: {moment(invitation.respondedAt).format('LLL')}
                  </p>
                  <Link
                    href={`/events/${invitation.event.id}`}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4" />
                    Деталі події
                  </Link>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Немає запрошень</h3>
            <p className="text-gray-600">
              {filter === 'all'
                ? 'У вас поки що немає запрошень'
                : `Немає запрошень зі статусом "${statusLabels[filter]}"`}
            </p>
          </div>
        )}
      </div>

      <SendInvitationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onInvitationSent={fetchInvitations}
      />
    </div>
  );
}
