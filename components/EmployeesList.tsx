'use client';

import React, { useState, useEffect } from 'react';
import { Users, Mail, Briefcase, Phone, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import CreateEmployeeModal from './CreateEmployeeModal';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  position?: string;
  department?: string;
  phone?: string;
  active: boolean;
}

export default function EmployeesList() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees');
      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // Групування працівників за відділами
  const employeesByDepartment = employees.reduce((acc, emp) => {
    const dept = emp.department || 'Без відділу';
    if (!acc[dept]) {
      acc[dept] = [];
    }
    acc[dept].push(emp);
    return acc;
  }, {} as Record<string, User[]>);

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

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Працівники</h1>
          <p className="text-gray-600 mt-2">Перегляд команди</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Працівники</h1>
          <p className="text-gray-600 mt-2">Перегляд команди та управління працівниками</p>
        </div>
        {(session?.user.role === 'admin' || session?.user.role === 'manager') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Додати працівника
          </button>
        )}
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Всього працівників</p>
              <p className="text-2xl font-bold text-gray-900">{employees.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Відділів</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.keys(employeesByDepartment).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Активних</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.filter((e) => e.active).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список працівників за відділами */}
      {Object.entries(employeesByDepartment).map(([department, departmentEmployees]) => (
        <div key={department} className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            {department}
            <span className="text-sm text-gray-500 font-normal">
              ({departmentEmployees.length} {departmentEmployees.length === 1 ? 'працівник' : 'працівників'})
            </span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentEmployees.map((employee) => (
              <div
                key={employee.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold">
                      {employee.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-600">{employee.position || 'Посада не вказана'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{employee.email}</span>
                  </div>

                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{employee.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      roleColors[employee.role] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {roleLabels[employee.role] || employee.role}
                  </span>
                  {!employee.active && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      Неактивний
                    </span>
                  )}
                </div>
              </div>
            ))}

      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEmployeeCreated={fetchEmployees}
      />
          </div>
        </div>
      ))}

      {employees.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Немає працівників</h3>
          <p className="text-gray-600">Працівники з'являться тут після додавання</p>
        </div>
      )}
    </div>
  );
}
