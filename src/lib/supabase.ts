// Central facade: re-export everything from split domain modules
export { supabase, createSupabaseClient } from './supabase/client'

// Users / Profile / Performance
export type { User, PerformanceGoalWithUser } from './supabase/users'
export {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getAllUsers,
  verifyOwnerAccess,
  getCurrentMonthYear,
  calculatePerformancePercentage,
  createPerformanceGoal,
  getUserPerformanceGoals,
  getAllPerformanceGoals,
  updatePerformanceGoal,
  deletePerformanceGoal,
} from './supabase/users'

// Store
export type { StoreProduct, StoreTransaction, PurchaseStoreProductResponse } from './supabase/store'
export {
  getStoreProducts,
  createStoreProduct,
  updateStoreProduct,
  deleteStoreProduct,
  getStoreTransactions,
  getAllStoreTransactions,
  deleteStoreTransaction,
  adjustUserPoints,
  purchaseStoreProduct,
} from './supabase/store'

// OTP
export type { OtpCode } from './supabase/otp'
export { getActiveOtpCodes } from './supabase/otp'

// Checklists
export type { DynamicChecklist, ChecklistWithAssignments } from './supabase/checklists'
export {
  getChecklistStatus,
  updateChecklistStep,
  getAllChecklistStatuses,
  getAllUsers as getAllUsersForChecklist,
  createDynamicChecklist,
  getAllDynamicChecklists,
  getUserChecklistAssignments,
  assignChecklistToUser,
  updateChecklistAssignment,
  updateDynamicChecklist,
  deleteDynamicChecklist,
  deleteChecklistAssignment,
} from './supabase/checklists'

// Tickets
export type { Ticket } from './supabase/tickets'
export {
  createTicket,
  getUserTickets,
  getAllTickets,
  updateTicket,
  deleteTicket,
} from './supabase/tickets'

// Events
export {
  getPublishedEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  getOwnerEvents,
  getEventParticipants,
  registerForEvent,
  getParticipantByReference,
  getParticipantsByEmail,
} from './supabase/events'

// Worklogs
export type { Worklog } from './supabase/worklogs'
export { createWorklog, getUserWorklogs, updateWorklog, deleteWorklog } from './supabase/worklogs'