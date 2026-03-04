/**
 * GitHub Messages Constants
 *
 * Terminal-style system messages for GitHub sync operations.
 * Used in the GitHubSyncPanel and related components.
 */

// =============================================================================
// GitHub Messages
// =============================================================================

export const GITHUB_MESSAGES = {
  PRIVACY_NOTICE:
    '[SYS_MESSAGE]: Analizando repositorios privados... Datos procesados de forma anónima. No se almacenarán nombres ni código fuente.',
  SYNC_SUCCESS:
    '[SYS_OK]: Validación GitHub completada. Datos de skills actualizados.',
  AUTH_ERROR:
    '[SYS_ERR]: Enlace perdido con la base de datos de GitHub. Reautoriza para continuar.',
  SYNC_ERROR:
    '[SYS_ERR]: Error al sincronizar con GitHub. Inténtalo de nuevo.',
  NO_SKILLS_MATCHED:
    '[SYS_INFO]: No se encontraron skills coincidentes en los repositorios analizados.',
} as const;
