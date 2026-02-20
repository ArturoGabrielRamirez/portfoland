/**
 * Services Feature
 *
 * Public API for the services feature.
 * Exports types, server actions, and public data functions.
 */

// Types
export type { ServiceModel, CreateServiceInput, UpdateServiceInput } from './types/service';
export { PriceType } from './types/service';

// Actions (server actions — must be called from server components or client components using useTransition)
export {
  createServiceAction,
  updateServiceAction,
  deleteServiceAction,
} from './actions/serviceActions';

// Public data functions (for portfolio aggregation in server components)
export { getPublicServicesData } from './data/getPublicServices.data';
export { getServicesByUserIdData } from './data/getServicesByUserId.data';

// Service layer (for use by other server-side features)
export {
  createServiceService,
  updateServiceService,
  deleteServiceService,
  getServicesService,
} from './services/service.service';

// Constants
export { SERVICE_MESSAGES } from './constants/messages';
export { MAX_SERVICES_PER_USER } from './constants/limits';

// Schemas
export {
  createServiceSchema,
  updateServiceSchema,
  deleteServiceSchema,
} from './schemas/service.schema';
export type {
  CreateServiceSchemaInput,
  UpdateServiceSchemaInput,
  DeleteServiceSchemaInput,
} from './schemas/service.schema';
