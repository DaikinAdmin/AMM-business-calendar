'use client';

import { getInvitations, getEmployeeById, getProjectById, getMeetingById, formatDateTime } from '@/lib/utils';
import { Invitation } from '@/types';
import { Mail, UserPlus, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const statusIcons = {
  pending: <Clock className="w-5 h-5 text-yellow-500" />,
  accepted: <CheckCircle className="w-5 h-5 text-green-500" />,
  declined: <XCircle className="w-5 h-5 text-red-500" />,
};

const statusLabels = {
  pending: 'Очікує',
  accepted: 'Прийнято',
  declined: 'Відхилено',
};

const statusColors = {
  pending: 'bg-yellow-50 border-yellow-200',
  accepted: 'bg-green-50 border-green-200',
  declined: 'bg-red-50 border-red-200',
};

export default function InvitationsList() {
  const invitations = getInvitations();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Запрошення</h1>
        <p className="text-gray-600 mt-2">Перегляд запрошень до проектів та зустрічей</p>
      </div>

      <div className="space-y-4">
        {invitations.map((invitation) => {
          const sender = getEmployeeById(invitation.senderId);
          const recipient = getEmployeeById(invitation.recipientId);
          
          let relatedItem;
          let relatedName = '';
          
          if (invitation.type === 'project') {
            relatedItem = getProjectById(invitation.relatedId);
            relatedName = relatedItem?.name || 'Проект не знайдено';
          } else {
            relatedItem = getMeetingById(invitation.relatedId);
            relatedName = relatedItem?.title || 'Зустріч не знайдена';
          }

          return (
            <div
              key={invitation.id}
              className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${statusColors[invitation.status]}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {invitation.type === 'project' ? (
                      <UserPlus className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Calendar className="w-6 h-6 text-blue-600" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {invitation.type === 'project' ? 'Запрошення до проекту' : 'Запрошення на зустріч'}
                      </h3>
                      {statusIcons[invitation.status]}
                    </div>

                    <p className="text-gray-700 font-medium mb-2">{relatedName}</p>

                    {invitation.message && (
                      <p className="text-gray-600 text-sm mb-3 italic">
                        &quot;{invitation.message}&quot;
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Від:</span> {sender?.name || 'Невідомо'}
                      </div>
                      <div>
                        <span className="font-medium">Кому:</span> {recipient?.name || 'Невідомо'}
                      </div>
                      <div>
                        <span className="font-medium">Дата:</span> {formatDateTime(invitation.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="ml-4">
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                    {statusLabels[invitation.status]}
                  </span>
                </div>
              </div>

              {invitation.status === 'pending' && (
                <div className="mt-4 flex gap-3 pt-4 border-t border-gray-200">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Прийняти
                  </button>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Відхилити
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {invitations.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Запрошень немає</h3>
            <p className="text-gray-600">Ви отримаєте повідомлення, коли вас запросять до проекту або зустрічі</p>
          </div>
        )}
      </div>
    </div>
  );
}
