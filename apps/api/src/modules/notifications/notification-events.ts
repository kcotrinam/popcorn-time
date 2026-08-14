import { Prisma, type NotificationType } from '@prisma/client';

export async function createNotification(
  tx: Prisma.TransactionClient,
  value: {
    recipientId: string;
    actorId?: string | null;
    type: NotificationType;
    recommendationId?: string;
    sharedPlanId?: string;
    contentTitle: string;
    deduplicationKey: string;
    metadata?: Prisma.InputJsonValue;
  },
) {
  if (value.recipientId === value.actorId) return;
  await tx.notification.createMany({
    data: [{ ...value, actorId: value.actorId ?? null, metadata: value.metadata ?? {} }],
    skipDuplicates: true,
  });
}
