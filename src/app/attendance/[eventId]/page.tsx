'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import AttendanceMarker from '@/components/AttendanceMarker';

interface EventDetails {
    id: number;
    date: Date;
    startTime: string;
    endTime: string;
    group: {
        id: number;
        name: string;
    };
    trainer: {
        firstName: string;
        lastName: string;
    };
    room?: {
        name: string;
    };
}

export default function AttendanceEventPage({ params }: { params: Promise<{ eventId: string }> }) {
    const { eventId } = use(params);
    const [event, setEvent] = useState<EventDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvent();
    }, [eventId]);

    const fetchEvent = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/schedule/${eventId}`);
            if (!response.ok) throw new Error('Failed to fetch event');
            const data = await response.json();
            setEvent(data);
        } catch (error) {
            console.error('Error fetching event:', error);
            alert('Nie udało się załadować szczegółów wydarzenia');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-slate-500 text-lg">Ładowanie...</div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="text-center py-16 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                    <span className="text-4xl block mb-4">❌</span>
                    <p className="text-slate-600 font-medium mb-4">Nie znaleziono wydarzenia</p>
                    <Link href="/attendance" className="btn-secondary inline-block">
                        Wróć do listy
                    </Link>
                </div>
            </div>
        );
    }

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('pl-PL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/attendance"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-4"
                >
                    ← Powrót do listy zajęć
                </Link>
                <h2 className="text-3xl font-bold text-slate-900">Obecność</h2>
                <p className="text-slate-500">Zaznacz obecność uczniów na zajęciach</p>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{event.group.name}</h3>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Data</p>
                        <p className="text-slate-900 capitalize">{formattedDate}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Godzina</p>
                        <p className="text-slate-900">{event.startTime} - {event.endTime}</p>
                    </div>
                    <div>
                        <p className="text-slate-500 font-medium mb-1">Trener</p>
                        <p className="text-slate-900">
                            {event.trainer.firstName} {event.trainer.lastName}
                        </p>
                    </div>
                    {event.room && (
                        <div>
                            <p className="text-slate-500 font-medium mb-1">Sala</p>
                            <p className="text-slate-900">{event.room.name}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Attendance Marker */}
            <AttendanceMarker
                eventId={parseInt(eventId)}
                groupId={event.group.id}
                onSave={() => {
                    // Optionally refresh data or show success message
                    console.log('Attendance saved');
                }}
            />
        </div>
    );
}
