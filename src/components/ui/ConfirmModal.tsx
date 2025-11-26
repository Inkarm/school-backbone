'use client';

import Modal from '@/components/ui/Modal';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary' | 'warning';
    isLoading?: boolean;
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Potwierdź',
    cancelText = 'Anuluj',
    variant = 'primary',
    isLoading = false,
}: ConfirmModalProps) {

    const getButtonClass = () => {
        switch (variant) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-orange-500 hover:bg-orange-600 text-white';
            default:
                return 'btn-primary';
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <p className="text-slate-600">{message}</p>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="btn-secondary"
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${getButtonClass()}`}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Przetwarzanie...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
