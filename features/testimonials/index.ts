/**
 * Testimonials Feature
 *
 * Public API for the testimonials feature.
 * Exports types, server actions, and public data functions.
 */

// Types
export type {
  TestimonialModel,
  CreateTestimonialInput,
  UpdateTestimonialInput,
} from './types/testimonial';

// Actions (server actions — must be called from server components or client components using useTransition)
export {
  createTestimonialAction,
  updateTestimonialAction,
  deleteTestimonialAction,
} from './actions/testimonialActions';

// Public data functions (for portfolio aggregation in server components)
export { getPublicTestimonialsData } from './data/getPublicTestimonials.data';
export { getTestimonialsByUserIdData } from './data/getTestimonialsByUserId.data';

// Service layer (for use by other server-side features)
export {
  createTestimonialService,
  updateTestimonialService,
  deleteTestimonialService,
  getTestimonialsService,
} from './services/testimonial.service';

// Constants
export { TESTIMONIAL_MESSAGES } from './constants/messages';
export { MAX_TESTIMONIALS_PER_USER } from './constants/limits';

// Schemas
export {
  createTestimonialSchema,
  updateTestimonialSchema,
  deleteTestimonialSchema,
} from './schemas/testimonial.schema';
export type {
  CreateTestimonialSchemaInput,
  UpdateTestimonialSchemaInput,
  DeleteTestimonialSchemaInput,
} from './schemas/testimonial.schema';
