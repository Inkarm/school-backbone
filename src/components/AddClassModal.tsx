'use client';

import { useState } from 'react';

interface AddClassModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddClassModal({ isOpen, onClose }: AddClassModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="glass-panel w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[hsl(var(--text-muted))] hover:text-white"
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-6">Dodaj Zajęcia</h2>

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Nazwa Grupy</label>
                        <input
                            type="text"
                            className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                            placeholder="np. Balet 1"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Dzień</label>
                            <select className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]">
                                <option>Poniedziałek</option>
                                <option>Wtorek</option>
                                <option>Środa</option>
                                <option>Czwartek</option>
                                <option>Piątek</option>
                                <option>Sobota</option>
                                <option>Niedziela</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Godzina</label>
                            <input
                                type="time"
                                className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-[hsl(var(--text-muted))]">Instruktor</label>
                        <select className="w-full bg-[hsl(var(--bg-dark))] border border-[hsl(var(--glass-border))] rounded-lg p-3 text-white focus:outline-none focus:border-[hsl(var(--primary))]">
                            <option>Anna Nowak</option>
                            <option>Piotr Kowalski</option>
                        </select>
                    </div>

                    <button type="submit" className="btn-primary w-full mt-4">
                        Zapisz do Grafiku
                    </button>
                </form>
            </div>
        </div>
    );
}
