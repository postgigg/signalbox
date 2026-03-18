'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select, type SelectOption } from '@/components/ui/Select';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AccountActionsProps {
  accountId: string;
  accountName: string;
  currentPlan: string;
  isSuspended: boolean;
  onImpersonate: (accountId: string) => void;
  onChangePlan: (accountId: string, plan: string) => void;
  onToggleSuspend: (accountId: string) => void;
  onDelete: (accountId: string) => void;
  onExtendTrial: (accountId: string) => void;
  onGiftPlan: (accountId: string) => void;
  onResetLimits: (accountId: string) => void;
}

/* ------------------------------------------------------------------ */
/*  Plan options                                                       */
/* ------------------------------------------------------------------ */

const planOptions: SelectOption[] = [
  { label: 'Free', value: 'free' },
  { label: 'Starter', value: 'starter' },
  { label: 'Pro', value: 'pro' },
  { label: 'Enterprise', value: 'enterprise' },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function AccountActions({
  accountId,
  accountName,
  currentPlan,
  isSuspended,
  onImpersonate,
  onChangePlan,
  onToggleSuspend,
  onDelete,
  onExtendTrial,
  onGiftPlan,
  onResetLimits,
}: AccountActionsProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);

  const canDelete = deleteConfirmation === accountName;

  const handleDelete = () => {
    if (canDelete) {
      onDelete(accountId);
      setDeleteModalOpen(false);
      setDeleteConfirmation('');
    }
  };

  const handleChangePlan = () => {
    onChangePlan(accountId, selectedPlan);
    setChangePlanModalOpen(false);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {/* Impersonate */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onImpersonate(accountId)}
        >
          Impersonate
        </Button>

        {/* Change Plan */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setChangePlanModalOpen(true)}
        >
          Change Plan
        </Button>

        {/* Suspend / Unsuspend */}
        <Button
          variant={isSuspended ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => onToggleSuspend(accountId)}
        >
          {isSuspended ? 'Unsuspend' : 'Suspend'}
        </Button>

        {/* Extend Trial */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onExtendTrial(accountId)}
        >
          Extend Trial
        </Button>

        {/* Gift Plan */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onGiftPlan(accountId)}
        >
          Gift Plan
        </Button>

        {/* Reset Limits */}
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onResetLimits(accountId)}
        >
          Reset Limits
        </Button>

        {/* Delete */}
        <Button
          variant="danger"
          size="sm"
          onClick={() => setDeleteModalOpen(true)}
        >
          Delete
        </Button>
      </div>

      {/* Change Plan Modal */}
      <Modal
        open={changePlanModalOpen}
        onClose={() => setChangePlanModalOpen(false)}
        title="Change Plan"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-stone">
            Change the plan for <span className="font-medium text-ink">{accountName}</span>.
            Current plan: <span className="font-mono text-signal">{currentPlan}</span>
          </p>
          <Select
            label="New Plan"
            name="new-plan"
            options={planOptions}
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setChangePlanModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleChangePlan}
            >
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteConfirmation('');
        }}
        title="Delete Account"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-stone">
            This action is <span className="font-medium text-danger">permanent and irreversible</span>.
            All data for this account will be deleted.
          </p>
          <p className="text-sm font-body text-stone">
            Type <span className="font-mono font-medium text-ink">{accountName}</span> to confirm:
          </p>
          <Input
            label="Account name"
            name="delete-confirmation"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder={accountName}
            error={
              deleteConfirmation.length > 0 && !canDelete
                ? 'Name does not match'
                : undefined
            }
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setDeleteModalOpen(false);
                setDeleteConfirmation('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              disabled={!canDelete}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
