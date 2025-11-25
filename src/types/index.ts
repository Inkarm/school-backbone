export interface User {
    id: number;
    login: string;
    role: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    phone: string | null;
    bio: string | null;
    color: string | null;
}

export interface Student {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth: string | null;
    parentName: string | null;
    parentPhone: string | null;
    parentEmail: string | null;
    healthNotes: string | null;
    notes: string | null;
    groups?: Group[];
    payments?: Payment[];
    attendance?: Attendance[];
}

export interface Group {
    id: number;
    name: string;
    defaultTrainerId: number | null;
    ratePerClass: number;
    defaultTrainer?: User | null;
    students?: Student[];
    scheduleEvents?: ScheduleEvent[];
}

export interface Room {
    id: number;
    name: string;
    capacity: number;
}

export interface ScheduleEvent {
    id: number;
    date: string; // ISO string from API
    startTime: string;
    endTime: string;
    status: 'SCHEDULED' | 'CANCELLED' | 'COMPLETED';
    description: string | null;
    roomId: number | null;
    groupId: number;
    trainerId: number;
    group?: Group;
    trainer?: User;
    room?: Room | null;
    attendance?: Attendance[];
}

export interface Attendance {
    id: number;
    eventId: number;
    studentId: number;
    status: 'present' | 'absent';
    student?: Student;
    event?: ScheduleEvent;
}

export interface Payment {
    id: number;
    studentId: number;
    amount: number;
    monthYear: string;
    paymentDate: string; // ISO string
    method: string;
    student?: Student;
}
