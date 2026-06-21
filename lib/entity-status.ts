import type { Status } from '@/lib/models';

type EntityWithStatus = {
  status_id: number;
  status?: Status;
};

export function enrichEntityWithStatus<T extends EntityWithStatus>(
  entity: T,
  statuses: Status[]
): T {
  if (entity.status?.name) {
    return entity;
  }

  const status = statuses.find((item) => item.id === entity.status_id);
  return status ? { ...entity, status } : entity;
}

export function enrichEntitiesWithStatus<T extends EntityWithStatus>(
  entities: T[],
  statuses: Status[]
): T[] {
  return entities.map((entity) => enrichEntityWithStatus(entity, statuses));
}

export function getEntityStatusName(
  entity: EntityWithStatus,
  statuses: Status[]
): string | undefined {
  if (entity.status?.name) {
    return entity.status.name;
  }

  return statuses.find((item) => item.id === entity.status_id)?.name;
}
