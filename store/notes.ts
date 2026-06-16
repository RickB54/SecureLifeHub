import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export interface Note {
  id: string;
  user_id: string;
  section_id: string | null;
  title: string;
  content: string;
  tags: string[];
  is_pinned: boolean;
  is_locked: boolean;
  versions: any[];
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  notebook_id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Notebook {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

interface NotesState {
  notes: Note[];
  sections: Section[];
  notebooks: Notebook[];
  refresh: () => Promise<void>;
  createNotebook: (name: string) => Promise<Notebook>;
  deleteNotebook: (id: string) => Promise<void>;
  updateNotebook: (id: string, name: string) => Promise<void>;
  createSection: (notebookId: string, name: string) => Promise<Section>;
  deleteSection: (id: string) => Promise<void>;
  updateSection: (id: string, name: string) => Promise<void>;
  createNote: (sectionId: string | null, title: string, content: string, tags?: string[]) => Promise<string>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: [],
  sections: [],
  notebooks: [],

  refresh: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [notebooksRes, sectionsRes, notesRes] = await Promise.all([
        supabase
          .from("sticky_notebooks")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("sticky_sections")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("sticky_notes")
          .select("*")
          .order("created_at", { ascending: true }),
      ]);

      if (notebooksRes.error) throw notebooksRes.error;
      if (sectionsRes.error) throw sectionsRes.error;
      if (notesRes.error) throw notesRes.error;

      set({
        notebooks: notebooksRes.data || [],
        sections: sectionsRes.data || [],
        notes: notesRes.data || [],
      });
    } catch (error) {
      console.error("Error refreshing notes store:", error);
    }
  },

  createNotebook: async (name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("sticky_notebooks")
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    await get().refresh();
    return data;
  },

  deleteNotebook: async (id: string) => {
    const { error } = await supabase
      .from("sticky_notebooks")
      .delete()
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },

  updateNotebook: async (id: string, name: string) => {
    const { error } = await supabase
      .from("sticky_notebooks")
      .update({ name })
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },

  createSection: async (notebookId: string, name: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("sticky_sections")
      .insert({ notebook_id: notebookId, name, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    await get().refresh();
    return data;
  },

  deleteSection: async (id: string) => {
    const { error } = await supabase
      .from("sticky_sections")
      .delete()
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },

  updateSection: async (id: string, name: string) => {
    const { error } = await supabase
      .from("sticky_sections")
      .update({ name })
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },

  createNote: async (sectionId: string | null, title: string, content: string, tags: string[] = []) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("sticky_notes")
      .insert({
        section_id: sectionId,
        title,
        content,
        tags,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    await get().refresh();
    return data.id;
  },

  updateNote: async (id: string, updates: Partial<Note>) => {
    const { error } = await supabase
      .from("sticky_notes")
      .update(updates)
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },

  deleteNote: async (id: string) => {
    const { error } = await supabase
      .from("sticky_notes")
      .delete()
      .eq("id", id);

    if (error) throw error;
    await get().refresh();
  },
}));
