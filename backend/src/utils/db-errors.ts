type DbError = { code?: string };

export type DbErrorMapping = { status: number; message: string };

export const mapDbError = (error: unknown): DbErrorMapping | null => {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const code = (error as DbError).code;
  switch (code) {
    case 'ER_DUP_ENTRY':
      return { status: 409, message: 'Record già esistente.' };
    case 'ER_NO_REFERENCED_ROW':
    case 'ER_NO_REFERENCED_ROW_2':
    case 'ER_ROW_IS_REFERENCED_2':
      return { status: 409, message: 'Vincolo di integrità violato.' };
    case 'ER_NO_SUCH_TABLE':
      return {
        status: 500,
        message: 'Schema ordini mancante. Esegui backend/sql/orders.sql.',
      };
    default:
      return null;
  }
};
