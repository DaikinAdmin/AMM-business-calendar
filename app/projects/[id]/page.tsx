'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  Calendar,
  Users,
  AlertCircle,
  ArrowLeft,
  DollarSign,
  User,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  clientName?: string;
  members?: any[];
  createdBy?: any;
  events?: any[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
  urgent: 'bg-red-200 text-red-800',
};

const statusLabels: Record<string, string> = {
  pending: 'Планування',
  in_progress: 'В процесі',
  completed: 'Завершено',
  cancelled: 'Скасовано',
};

const priorityLabels: Record<string, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
  urgent: 'Терміново',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      fetchProject(params.id as string);
    }
  }, [params]);

  const fetchProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data);
      } else {
        router.push('/projects');
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      year: 'numeric',
      month: 'short',
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

  if (!project) {
    return null;
  }

  const projectColor =
    project.priority === 'high' || project.priority === 'urgent'
      ? '#ef4444'
      : '#3b82f6';

  return (
    <div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до проектів
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-8 border-l-4" style={{ borderLeftColor: projectColor }}>
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: `${projectColor}20` }}>
              <FolderKanban className="w-8 h-8" style={{ color: projectColor }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <div className="flex gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[project.status] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {statusLabels[project.status] || project.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    priorityColors[project.priority] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {priorityLabels[project.priority] || project.priority}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Опис проекту</h3>
            <p className="text-gray-900">{project.description || 'Опис відсутній'}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Дати проекту</p>
                <p className="text-gray-900">
                  {formatDate(project.startDate)} - {formatDate(project.endDate)}
                </p>
              </div>
            </div>

            {project.budget && (
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Бюджет</p>
                  <p className="text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
              </div>
            )}

            {project.clientName && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Клієнт</p>
                  <p className="text-gray-900">{project.clientName}</p>
                </div>
              </div>
            )}

            {project.createdBy && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Створив</p>
                  <p className="text-gray-900">{project.createdBy.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Team Members */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Команда проекту ({project.members?.length || 0})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.members?.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                  {member.user?.name
                    ?.split(' ')
                    .map((n: string) => n[0])
                    .join('') || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.user?.name}</p>
                  <p className="text-sm text-gray-600">
                    {member.role || member.user?.position || 'Учасник'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {(!project.members || project.members.length === 0) && (
            <p className="text-gray-500 text-center py-8">
              Немає учасників у цьому проекті
            </p>
          )}
        </div>

        {/* Related Events */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Пов'язані події ({project.events?.length || 0})
          </h2>

          {project.events && project.events.length > 0 ? (
            <div className="space-y-3">
              {project.events.map((event: any) => (
                <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {event.description || 'Без опису'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDateTime(event.startTime)} - {formatDateTime(event.endTime)}
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {event.type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Немає пов'язаних подій</p>
          )}
        </div>
      </div>
    </div>
  );
}
