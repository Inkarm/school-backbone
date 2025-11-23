'use client';

import { useState } from 'react';
import AddStudentModal from '@/components/AddStudentModal';
import AddPaymentModal from '@/components/AddPaymentModal';

export default function Home() {
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold mb-2 tracking-tight text-slate-900">Witaj, Admin 👋</h2>
        <p className="text-slate-500">Oto co się dzieje dzisiaj w Twojej szkole.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="clean-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-6xl text-slate-900">📅</span>
          </div>
          <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Dzisiejsze zajęcia</h3>
          <p className="text-4xl font-bold text-slate-900">8</p>
        </div>

        <div className="clean-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-6xl text-slate-900">👥</span>
          </div>
          <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Obecni uczniowie</h3>
          <p className="text-4xl font-bold text-slate-900">124</p>
        </div>

        <div className="clean-card p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <span className="text-6xl text-slate-900">💰</span>
          </div>
          <h3 className="text-sm font-medium mb-2 text-slate-500 uppercase tracking-wider">Wpłaty (Msc)</h3>
          <p className="text-4xl font-bold text-emerald-600">12.5k</p>
        </div>
      </div>

      <div className="clean-card p-8">
        <h3 className="text-xl font-bold mb-6 tracking-tight text-slate-900">Szybkie akcje</h3>
        <div className="flex gap-4">
          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="btn-primary flex items-center gap-2"
          >
            <span>+</span> Dodaj Ucznia
          </button>
          <button
            onClick={() => setIsPaymentModalOpen(true)}
            className="btn-secondary"
          >
            Nowa Wpłata
          </button>
        </div>
      </div>

      <AddStudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
      />

      <AddPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </div>
  );
}
