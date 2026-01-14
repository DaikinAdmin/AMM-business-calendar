'use client';

import { getProjects, getMeetings, getEmployees, getInvitations } from '@/lib/utils';
import { Calendar, FolderKanban, Users, Mail, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const projects = getProjects();
  const meetings = getMeetings();
  const employees = getEmployees();
  const invitations = getInvitations();

  const activeProjects = projects.filter(p => p.status === 'in-progress');
  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  
  // Найближчі зустрічі (наступні 7 днів)
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const upcomingMeetings = meetings
    .filter(m => m.start >= now && m.start <= nextWeek)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .slice(0, 5);

  const stats = [
    {
      name: 'Активні проекти',
      value: activeProjects.length,
      total: projects.length,
      icon: FolderKanban,
      color: 'blue',
      href: '/projects',
    },
    {
      name: 'Зустрічей цього тижня',
      value: upcomingMeetings.length,
      total: meetings.length,
      icon: Calendar,
      color: 'green',
      href: '/calendar',
    },
    {
      name: 'Працівників',
      value: employees.length,
      total: null,
      icon: Users,
      color: 'purple',
      href: '/employees',
    },
    {
      name: 'Нові запрошення',
      value: pendingInvitations.length,
      total: invitations.length,
      icon: Mail,
      color: 'orange',
      href: '/invitations',
    },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Дашборд</h1>
        <p className="text-gray-600 mt-2">Огляд поточної активності компанії</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.name}</p>
              <p className="text-3xl font-bold text-gray-900">
                {stat.value}
                {stat.total !== null && (
                  <span className="text-lg text-gray-500 ml-2">/ {stat.total}</span>
                )}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Найближчі зустрічі */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Найближчі зустрічі
            </h2>
            <Link href="/calendar" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Всі →
            </Link>
          </div>

          {upcomingMeetings.length > 0 ? (
            <div className="space-y-3">
              {upcomingMeetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{meeting.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {meeting.start.toLocaleDateString('uk-UA', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {meeting.location && (
                        <p className="text-sm text-gray-500">{meeting.location}</p>
                      )}
                    </div>
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: meeting.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Немає запланованих зустрічей</p>
          )}
        </div>

        {/* Активні проекти */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Активні проекти
            </h2>
            <Link href="/projects" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Всі →
            </Link>
          </div>

          {activeProjects.length > 0 ? (
            <div className="space-y-3">
              {activeProjects.slice(0, 5).map((project) => (
                <div
                  key={project.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                      style={{ backgroundColor: project.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{project.members.length} учасників</span>
                        <span>•</span>
                        <span>
                          До {project.endDate.toLocaleDateString('uk-UA', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">Немає активних проектів</p>
          )}
        </div>
      </div>
    </div>
  );
}
