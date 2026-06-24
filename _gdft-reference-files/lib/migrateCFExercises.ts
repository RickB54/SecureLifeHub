/**
 * migrateCFExercises.ts
 *
 * One-time migration utility: tags all Choice Fitness (CF-prefix) exercises
 * in the user's Supabase exercise table to their corresponding gym sections.
 *
 * Zone mapping (derived from existing exercise names):
 *   CFA → Area A — Arms (MTS Machines)
 *   CFB → Area B — Chest & Shoulders (MTS Machines)
 *   CFC → Area C — Back (MTS Machines)
 *   CFD → Area D — Core (MTS Machines)
 *   CFE → Area E — Legs & Misc (Precor / Squat)
 *   CFF → Area F — Legs & Back (Cybex / TechnoGym)
 */

import { api } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface MigrationResult {
  gym: string;
  gymId: string;
  created: boolean; // true = new gym record was created, false = existing gym was reused
  sections: {
    name: string;
    sectionId: string;
    exercisesTagged: number;
  }[];
  totalTagged: number;
  errors: string[];
}

/** Prefix → human-readable zone name */
const ZONE_MAP: Record<string, { label: string; description: string }> = {
  CFA: { label: "CF-A — Arms",           description: "MTS Arm Machines (Triceps, Biceps)" },
  CFB: { label: "CF-B — Chest & Shoulders", description: "MTS Chest and Shoulder Machines" },
  CFC: { label: "CF-C — Back",            description: "MTS Row and Pulldown Machines" },
  CFD: { label: "CF-D — Core",            description: "MTS Abdominal and Rotational Machines" },
  CFE: { label: "CF-E — Legs & Misc",     description: "Precor Leg Curl, Squat Machines" },
  CFF: { label: "CF-F — Legs & Back",     description: "Cybex Eagle and TechnoGym Machines" },
};

/** Extract the prefix (CFA, CFB, …) from an exercise name */
function getPrefix(name: string): string | null {
  // Match "CFA", "CFB", … "CFF" at the start of the name (case-insensitive)
  const m = name.trim().toUpperCase().match(/^(CF[A-F])/);
  return m ? m[1] : null;
}

export async function migrateCFExercisesToGym(userId: string): Promise<MigrationResult> {
  const errors: string[] = [];
  const result: MigrationResult = {
    gym: "Choice Fitness",
    gymId: "",
    created: false,
    sections: [],
    totalTagged: 0,
    errors,
  };

  // ── 1. Load all exercises from Supabase ──────────────────────────────────
  const { data: allExercises, error: exErr } = await supabase
    .from("exercises")
    .select("id, name, gym_id, gym_section_id")
    .eq("user_id", userId);

  if (exErr) throw new Error(`Failed to load exercises: ${exErr.message}`);

  // ── 2. Find or create the Choice Fitness gym ─────────────────────────────
  const { data: gyms, error: gymListErr } = await supabase
    .from("gyms")
    .select("*")
    .eq("user_id", userId);

  if (gymListErr) throw new Error(`Failed to load gyms: ${gymListErr.message}`);

  let gym = (gyms || []).find(
    (g: any) => g.name?.toLowerCase().includes("choice") || g.name?.toLowerCase().includes("choice fitness")
  );

  // Build the sections array we want
  const desiredSectionIds: Record<string, string> = {};
  for (const prefix of Object.keys(ZONE_MAP)) {
    desiredSectionIds[prefix] = uuidv4();
  }

  if (gym) {
    // Gym exists — merge sections (add any missing zones, keep existing ones)
    const existingSections: any[] = gym.sections || [];
    const existingByLabel: Record<string, any> = {};
    for (const s of existingSections) {
      // Try to match by label prefix (e.g. "CF-A", "CF-B") or exact label
      for (const [prefix, meta] of Object.entries(ZONE_MAP)) {
        if (
          s.name?.includes(prefix) ||
          s.name?.toLowerCase() === meta.label.toLowerCase() ||
          s.name?.toLowerCase().includes(prefix.toLowerCase())
        ) {
          existingByLabel[prefix] = s;
        }
      }
    }

    // Merge: append new zones that don't exist yet
    let changed = false;
    for (const [prefix, meta] of Object.entries(ZONE_MAP)) {
      if (!existingByLabel[prefix]) {
        existingSections.push({
          id: desiredSectionIds[prefix],
          name: meta.label,
          description: meta.description,
          equipment: [],
        });
        changed = true;
      } else {
        desiredSectionIds[prefix] = existingByLabel[prefix].id;
      }
    }

    if (changed) {
      const { error: updateErr } = await supabase
        .from("gyms")
        .update({ sections: existingSections })
        .eq("id", gym.id);
      if (updateErr) throw new Error(`Failed to update gym sections: ${updateErr.message}`);
    }

    result.gymId = gym.id;
    result.created = false;
  } else {
    // No Choice Fitness gym exists — create it
    const newSections = Object.entries(ZONE_MAP).map(([prefix, meta]) => ({
      id: desiredSectionIds[prefix],
      name: meta.label,
      description: meta.description,
      equipment: [],
    }));

    const { data: created, error: createErr } = await supabase
      .from("gyms")
      .insert({
        user_id: userId,
        name: "Choice Fitness",
        location: "Choice Fitness Gym",
        description: "My local gym — organized by machine area zones A through F.",
        type: "Commercial",
        sections: newSections,
      })
      .select()
      .maybeSingle();

    if (createErr) throw new Error(`Failed to create gym: ${createErr.message}`);
    result.gymId = created.id;
    result.created = true;
  }

  // ── 3. Tag exercises by prefix ───────────────────────────────────────────
  for (const [prefix, meta] of Object.entries(ZONE_MAP)) {
    const sectionId = desiredSectionIds[prefix];
    const matching = (allExercises || []).filter(
      (ex: any) => getPrefix(ex.name) === prefix
    );

    let tagged = 0;
    for (const ex of matching) {
      const { error: tagErr } = await supabase
        .from("exercises")
        .update({ gym_id: result.gymId, gym_section_id: sectionId })
        .eq("id", ex.id);

      if (tagErr) {
        errors.push(`Failed to tag "${ex.name}": ${tagErr.message}`);
      } else {
        tagged++;
      }
    }

    result.sections.push({
      name: meta.label,
      sectionId,
      exercisesTagged: tagged,
    });
    result.totalTagged += tagged;
  }

  return result;
}
