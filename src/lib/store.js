import { create } from 'zustand'

export const useStore = create((set, get) => ({
  user: null,

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),

  getRole: () => get().user?.portal_role || null,

  isAdmin: () => {
    const role = get().getRole()
    return role === 'admin' || role === 'direction'
  },

  isClient: () => get().getRole() === 'client',
  isSuperAdmin: () => get().getRole() === 'admin',

  perm: (key) => {
    const role = get().getRole()
    if (!role) return false
    return PERMS[role]?.[key] || false
  }
}))

const PERMS = {
  admin: {
    canEditPost: true, canDeletePost: true, canAddPost: true,
    canEditClient: true, canDeleteClient: true, canAddClient: true,
    canEditEvent: true, canDeleteEvent: true, canAddEvent: true,
    canEditAsset: true, canDeleteAsset: true, canAddAsset: true,
    canViewAllClients: true, canImportCSV: true,
    seeAcces: true, seeTrash: true
  },
  direction: {
    canEditPost: true, canDeletePost: true, canAddPost: true,
    canEditClient: true, canDeleteClient: false, canAddClient: true,
    canEditEvent: true, canDeleteEvent: true, canAddEvent: true,
    canEditAsset: true, canDeleteAsset: false, canAddAsset: true,
    canViewAllClients: true, canImportCSV: true,
    seeAcces: false, seeTrash: false
  },
  client: {
    canEditPost: false, canDeletePost: false, canAddPost: false,
    canEditClient: false, canDeleteClient: false, canAddClient: false,
    canEditEvent: false, canDeleteEvent: false, canAddEvent: false,
    canEditAsset: false, canDeleteAsset: false, canAddAsset: false,
    canViewAllClients: false, canImportCSV: false,
    seeAcces: false, seeTrash: false
  }
}
