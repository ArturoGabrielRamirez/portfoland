/**
 * Skills Server Actions
 *
 * Re-exports all server actions for the skills feature.
 */

// Query actions
export { getSkills, type GetSkillsResponse } from './getSkills';
export { getSkillById, getPublicSkillById } from './getSkillById';

// Mutation actions
export { createSkill } from './createSkill';
export { updateSkill } from './updateSkill';
export { deleteSkill, type DeleteSkillResult } from './deleteSkill';
export { createCategory } from './createCategory';
export { syncSkillsFromExperience, type SyncSkillsResponse } from './syncSkillsFromExperience';
