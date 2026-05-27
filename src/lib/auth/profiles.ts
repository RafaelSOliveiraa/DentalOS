"use client";

import { useState, useEffect } from "react";

/* ─── Types ─── */

export type ProfileType = "ADMIN" | "RECEPCIONISTA" | "DENTISTA";

export type Resource =
  | "dashboard"
  | "financeiro"
  | "relatorios"
  | "estoque"
  | "pacientes"
  | "agenda"
  | "ia"
  | "configuracoes"
  | "recepcao"
  // Financial sub-resources (used for field-level control)
  | "estoque_custos"   // unit cost values in stock table
  | "lucro_margem"     // profit, margin, net income
  | "despesas"         // operational expenses
  | "salarios";        // payroll / pro-labore

export interface Profile {
  type: ProfileType;
  name: string;
  role: string;
  initials: string;
  color: string;
  defaultPath: string;
}

/* ─── Profile definitions ─── */

export const PROFILES: Record<ProfileType, Profile> = {
  ADMIN: {
    type: "ADMIN",
    name: "Dra. Ana Paula",
    role: "Proprietária · Admin",
    initials: "AP",
    color: "#1D9E75",
    defaultPath: "/dashboard",
  },
  RECEPCIONISTA: {
    type: "RECEPCIONISTA",
    name: "Carol",
    role: "Recepcionista",
    initials: "CA",
    color: "#5B8DEF",
    defaultPath: "/dashboard/recepcao",
  },
  DENTISTA: {
    type: "DENTISTA",
    name: "Dr. Bruno",
    role: "Dentista Associado",
    initials: "BR",
    color: "#9B6DFF",
    defaultPath: "/dashboard/agenda",
  },
};

/* ─── Permissions ─── */

const PERMISSIONS: Record<ProfileType, Set<Resource>> = {
  ADMIN: new Set([
    "dashboard",
    "financeiro",
    "relatorios",
    "estoque",
    "pacientes",
    "agenda",
    "ia",
    "configuracoes",
    "recepcao",
    "estoque_custos",
    "lucro_margem",
    "despesas",
    "salarios",
  ]),
  RECEPCIONISTA: new Set([
    // Pages
    "recepcao",
    "agenda",
    "pacientes",
    "estoque",
    // Fine-grained: can see patient balances but NOT clinic-wide financials
    // estoque: can view items but NOT unit costs → estoque_custos NOT granted
  ]),
  DENTISTA: new Set([
    "agenda",
    // Only own patients/agenda — enforced at component level
  ]),
};

/* ─── canAccess ─── */

/**
 * Returns true if the given profile type has access to the resource.
 *
 * @example
 * canAccess("RECEPCIONISTA", "financeiro") // false
 * canAccess("ADMIN", "salarios")           // true
 */
export function canAccess(profileType: ProfileType, resource: Resource): boolean {
  return PERMISSIONS[profileType].has(resource);
}

/* ─── Persistence ─── */

const STORAGE_KEY = "dentalos_profile";

/**
 * Persist the selected profile to localStorage.
 * Call this on login / profile switch before redirecting.
 */
export function saveProfile(type: ProfileType): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, type);
  }
}

/* ─── useProfile hook ─── */

/**
 * Client-side hook. Returns the active profile, its type, and a
 * convenience `canAccess` bound to the current profile.
 *
 * Defaults to ADMIN when nothing is stored (first visit / cleared storage).
 */
export function useProfile() {
  const [profileType, setProfileType] = useState<ProfileType>("ADMIN");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ProfileType | null;
    if (stored && stored in PROFILES) {
      setProfileType(stored);
    }
  }, []);

  const profile = PROFILES[profileType];

  return {
    profile,
    profileType,
    /** Bound convenience — no need to pass profileType each time */
    canAccess: (resource: Resource) => canAccess(profileType, resource),
  };
}
