'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface ProfileFormProps {
  initialFullName: string;
  email: string;
  initialPhone: string;
}

export default function ProfileForm({ initialFullName, email, initialPhone }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phone }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to update your profile.');
      }

      toast.success(payload.message || 'Profile updated successfully.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input label="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} required />
      <Input label="Email" value={email} readOnly hint="Contact support if you need to change your email address." />
      <Input label="Phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
      <Button onClick={handleSave} isLoading={isSaving} loadingText="Saving...">Save changes</Button>
    </div>
  );
}
