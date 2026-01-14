'use client';

import React from 'react';
import { getProjects, getProjectMembers, formatDate } from '@/lib/utils';
import { Project } from '@/types';
import { FolderKanban, Calendar, Users, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const statusColors = {
  planning: 'bg-yellow-100 text-yellow-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  'on-hold': 'bg-gray-100 text-gray-800',
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-orange-100 text-orange-600',
  high: 'bg-red-100 text-red-600',
};

const statusLabels = {
  planning: 'Планування',
  'in-progress': 'В процесі',
  completed: 'Завершено',
  'on-hold': 'Призупинено',
};

const priorityLabels = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
};

export default function ProjectsList() {
  const projects = getProjects();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Проекти</h1>
        <p className="text-gray-600 mt-2">Управління всіма проектами компанії</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const members = getProjectMembers(project.id);
          
          return (
            <div
              key={project.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border-l-4"
              style={{ borderLeftColor: project.color }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-6 h-6" style={{ color: project.color }} />
                  <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {project.description}
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
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status]}`}>
                  {statusLabels[project.status]}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[project.priority]}`}>
                  <AlertCircle className="w-3 h-3 inline mr-1" />
                  {priorityLabels[project.priority]}
                </span>
              </div>

              <div className="flex -space-x-2">
                {members.slice(0, 5).map((member, idx) => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                    title={member.name}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
                {members.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold border-2 border-white">
                    +{members.length - 5}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
