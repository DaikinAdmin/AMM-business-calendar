export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  workload: number; // відсоток завантаженості 0-100
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  members: string[]; // employee IDs
  color: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: string[]; // employee IDs
  projectId?: string;
  location?: string;
  type: 'meeting' | 'event' | 'deadline';
  color?: string;
}

export interface Invitation {
  id: string;
  type: 'project' | 'meeting';
  relatedId: string; // project or meeting ID
  senderId: string; // employee ID
  recipientId: string; // employee ID
  status: 'pending' | 'accepted' | 'declined';
  createdAt: Date;
  message?: string;
}

export interface CalendarEvent extends Meeting {
  resource?: {
    projectId?: string;
    type: string;
  };
}
