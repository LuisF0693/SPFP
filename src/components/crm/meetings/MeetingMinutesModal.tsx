import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { MeetingMinutesForm, MeetingMinutesData } from './MeetingMinutesForm';

interface MeetingMinutesModalProps {
  isOpen: boolean;
  clientId: string;
  clientName: string;
  onClose: () => void;
  onSave?: (data: MeetingMinutesData) => void;
}

export const MeetingMinutesModal: React.FC<MeetingMinutesModalProps> = ({
  isOpen,
  clientId,
  clientName,
  onClose,
  onSave,
}) => {
  const handleSave = (data: MeetingMinutesData) => {
    onSave?.(data);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Criar Ata de Reunião"
      size="lg"
      variant="dark"
    >
      <MeetingMinutesForm
        clientId={clientId}
        clientName={clientName}
        onSave={handleSave}
        onCancel={onClose}
      />
    </Modal>
  );
};

export default MeetingMinutesModal;
