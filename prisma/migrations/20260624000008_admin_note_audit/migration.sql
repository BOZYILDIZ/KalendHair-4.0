-- Migration Sprint 19 correctif — Audit des notes internes
-- Additive uniquement : ajout de 3 valeurs à l'enum admin_action.
-- Aucun DROP, aucune modification destructive.

ALTER TYPE "admin_action" ADD VALUE IF NOT EXISTS 'ADD_NOTE';
ALTER TYPE "admin_action" ADD VALUE IF NOT EXISTS 'UPDATE_NOTE';
ALTER TYPE "admin_action" ADD VALUE IF NOT EXISTS 'DELETE_NOTE';
