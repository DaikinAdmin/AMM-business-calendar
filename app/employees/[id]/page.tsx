'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Phone, Briefcase, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';
import 'moment/locale/uk';

moment.locale('uk');

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  position?: string;
  department?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  type: string;
}

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    if (params?.id) {
      fetchEmployee(params.id as string);
      fetchEmployeeEvents(params.id as string);
    }
  }, [params]);

  const fetchEmployee = async (id: string) => {
    try {
      const response = await fetch(`/api/employees/${id}`);
      if (response.ok) {
        const data = await response.json();
        setEmployee(data);
      } else {
        router.push('/employees');
      }
    } catch (error) {
      console.error('Error fetching employee:', error);
      router.push('/employees');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeeEvents = async (id: string) => {
    try {
      const response = await fetch(`/api/events?userId=${id}`);
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: 'Адміністратор',
    manager: 'Менеджер',
    employee: 'Працівник',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-800',
    manager: 'bg-blue-100 text-blue-800',
    employee: 'bg-green-100 text-green-800',
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const upcomingEvents = getUpcomingEvents();

  return (
    <div>
      <Link
        href="/employees"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад до працівників
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Employee Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-3xl font-semibold mb-4">
              {employee.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 text-center">{employee.name}</h1>
            <p className="text-gray-600 mt-1">{employee.position || 'Посада не вказана'}</p>
            <span
              className={`mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                roleColors[employee.role] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {roleLabels[employee.role] || employee.role}
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="truncate">{employee.email}</p>
              </div>
            </div>

            {employee.phone && (
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p>{employee.phone}</p>
                </div>
              </div>
            )}

            {employee.department && (
              <div className="flex items-center gap-3 text-gray-700">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Відділ</p>
                  <p>{employee.department}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-gray-700">
              <Calendar className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Дата приєднання</p>
                <p>{moment(employee.createdAt).format('LL')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <Link
              href={`/calendar?employee=${employee.id}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4" />
              Переглянути календар
            </Link>
          </div>
        </div>

        {/* Events and Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Найближчі події ({upcomingEvents.length})
            </h2>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{event.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {moment(event.startTime).format('LLL')}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {event.type}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Немає запланованих подій</p>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{events.length}</div>
                <p className="text-gray-600">Всього подій</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{upcomingEvents.length}</div>
                <p className="text-gray-600">Майбутніх подій</p>
              </div>
            </div>
          </div>

          {/* All Events Calendar View */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Всі події</h2>
            
            {events.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events
                  .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
                  .map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {moment(event.startTime).format('LL')} • {moment(event.startTime).format('LT')}
                          </p>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {event.type}
                        </span>
                      </div>
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">Немає подій</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
