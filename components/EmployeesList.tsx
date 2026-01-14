'use client';

import { getEmployees, getEmployeeProjects, getEmployeeMeetings } from '@/lib/utils';
import { Employee } from '@/types';
import { Users, Mail, Briefcase, Calendar, TrendingUp } from 'lucide-react';

const getWorkloadColor = (workload: number) => {
  if (workload >= 85) return 'bg-red-500';
  if (workload >= 70) return 'bg-orange-500';
  if (workload >= 50) return 'bg-yellow-500';
  return 'bg-green-500';
};

const getWorkloadLabel = (workload: number) => {
  if (workload >= 85) return 'Високе навантаження';
  if (workload >= 70) return 'Помірне навантаження';
  if (workload >= 50) return 'Нормальне навантаження';
  return 'Низьке навантаження';
};

export default function EmployeesList() {
  const employees = getEmployees();

  // Групування працівників за відділами
  const employeesByDepartment = employees.reduce((acc, emp) => {
    if (!acc[emp.department]) {
      acc[emp.department] = [];
    }
    acc[emp.department].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  const averageWorkload = Math.round(
    employees.reduce((sum, emp) => sum + emp.workload, 0) / employees.length
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Працівники</h1>
        <p className="text-gray-600 mt-2">Перегляд команди та завантаження працівників</p>
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
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Середнє навантаження</p>
              <p className="text-2xl font-bold text-gray-900">{averageWorkload}%</p>
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
            {departmentEmployees.map((employee) => {
              const projects = getEmployeeProjects(employee.id);
              const meetings = getEmployeeMeetings(employee.id);

              return (
                <div
                  key={employee.id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-lg font-semibold flex-shrink-0">
                      {employee.name.split(' ').map(n => n[0]).join('')}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {employee.name}
                      </h3>
                      <p className="text-sm text-gray-600">{employee.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{employee.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4" />
                        <span>{projects.length} проектів</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{meetings.length} зустрічей</span>
                      </div>
                    </div>
                  </div>

                  {/* Індикатор завантаження */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Завантаження
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {employee.workload}%
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all ${getWorkloadColor(employee.workload)}`}
                        style={{ width: `${employee.workload}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {getWorkloadLabel(employee.workload)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
