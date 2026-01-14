import { Employee, Project, Meeting, Invitation } from '@/types';
import employeesData from '@/data/employees.json';
import projectsData from '@/data/projects.json';
import meetingsData from '@/data/meetings.json';
import invitationsData from '@/data/invitations.json';

// Parse dates from JSON
export const getEmployees = (): Employee[] => {
  return employeesData as Employee[];
};

export const getProjects = (): Project[] => {
  return projectsData.map(p => ({
    ...p,
    startDate: new Date(p.startDate),
    endDate: new Date(p.endDate),
  })) as Project[];
};

export const getMeetings = (): Meeting[] => {
  return meetingsData.map(m => ({
    ...m,
    start: new Date(m.start),
    end: new Date(m.end),
  })) as Meeting[];
};

export const getInvitations = (): Invitation[] => {
  return invitationsData.map(i => ({
    ...i,
    createdAt: new Date(i.createdAt),
  })) as Invitation[];
};

export const getEmployeeById = (id: string): Employee | undefined => {
  return getEmployees().find(emp => emp.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  return getProjects().find(proj => proj.id === id);
};

export const getMeetingById = (id: string): Meeting | undefined => {
  return getMeetings().find(meet => meet.id === id);
};

export const getProjectMembers = (projectId: string): Employee[] => {
  const project = getProjectById(projectId);
  if (!project) return [];
  return project.members.map(id => getEmployeeById(id)).filter(Boolean) as Employee[];
};

export const getEmployeeProjects = (employeeId: string): Project[] => {
  return getProjects().filter(project => project.members.includes(employeeId));
};

export const getEmployeeMeetings = (employeeId: string): Meeting[] => {
  return getMeetings().filter(meeting => meeting.attendees.includes(employeeId));
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
