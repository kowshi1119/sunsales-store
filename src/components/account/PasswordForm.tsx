'use client';

import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;

  if (score <= 1) return { label: 'Weak', className: 'text-rose-600' };
  if (score <= 3) return { label: 'Medium', className: 'text-amber-600' };
  return { label: 'Strong', className: 'text-emerald-600' };
}

export default function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const strength = useMemo(() => getPasswordStrength(newPassword), [newPassword]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to update your password.');
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(payload.message || 'Password updated successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update your password.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input label="Current password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required />
      <div>
        <Input label="New password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required />
        {newPassword && <p className={`mt-1 text-body-xs ${strength.className}`}>Strength: {strength.label}</p>}
      </div>
      <Input label="Confirm new password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
      <Button onClick={handleSave} isLoading={isSaving} loadingText="Saving...">Update password</Button>
    </div>
  );
}
