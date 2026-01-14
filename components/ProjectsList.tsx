'use client';

import React, { useState, useEffect } from 'react';
import { FolderKanban, Calendar, Users, AlertCircle, Plus } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import CreateProjectModal from './CreateProjectModal';

interface Project {
  id: number;
  name: string;
  description?: string;
  status: string;
  priority: string;
  startDate?: string;
  endDate?: string;
  members?: any[];
  createdBy?: any;
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

export default function ProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не вказано';
    return new Date(dateString).toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Проекти</h1>
          <p className="text-gray-600 mt-2">Управління всіма проектами компанії</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Проекти</h1>
          <p className="text-gray-600 mt-2">Управління всіма проектами компанії</p>
        </div>
        {(session?.user.role === 'admin' || session?.user.role === 'manager') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Створити проект
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const members = project.members || [];
          const projectColor = project.priority === 'high' || project.priority === 'urgent' ? '#ef4444' : '#3b82f6';
          
          return (
            <Link
              href={`/projects/${project.id}`}
              key={project.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 block"
              style={{ borderLeftColor: projectColor }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-6 h-6" style={{ color: projectColor }} />
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description || 'Опис відсутній'}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{members.length} {members.length === 1 ? 'учасник' : 'учасників'}</span>
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[project.status] || project.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority] || 'bg-gray-100 text-gray-800'}`}>
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {priorityLabels[project.priority] || project.priority}
                </span>
              </div>

              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member: any, idx: number) => (
                  <div
                    key={member.user?.id || idx}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                    title={member.user?.name}
                  >
                    {member.user?.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                  </div>
                ))}
                {members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <FolderKanban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Немає проектів</h3>
          <p className="text-gray-600">Проекти з'являться тут після створення</p>
        </div>
      )}

      <CreateProjectModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
}
