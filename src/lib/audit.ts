import { AuditAction, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

interface CreateAuditLogInput {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  details?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}

export function getClientIp(headers: Headers): string | null {
  const forwardedFor = headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null;
  }

  return headers.get('x-real-ip');
}

export async function createAuditLog({ userId, action, entity, entityId, details, ipAddress }: CreateAuditLogInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId: entityId || null,
        details,
        ipAddress: ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
