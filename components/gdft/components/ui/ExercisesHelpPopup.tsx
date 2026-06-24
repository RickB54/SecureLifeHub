
import React from 'react';
import { ModernHelpDialog } from './ModernHelpDialog';

interface ExercisesHelpPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ─── Small reusable building blocks ──────────────────────────── */

const Badge = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${color}`}>
    {children}
  </span>
);

const Section = ({ icon, title, color, children }: { icon: string; title: string; color: string; children: React.ReactNode }) => (
  <div className={`rounded-2xl border p-4 space-y-2 ${color}`}>
    <h4 className="font-black text-sm flex items-center gap-2">
      <span className="text-base">{icon}</span>
      {title}
    </h4>
    {children}
  </div>
);

const Step = ({ num, color, children }: { num: number; color: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5 ${color}`}>
      {num}
    </div>
    <p className="text-xs text-gray-300 leading-relaxed">{children}</p>
  </div>
);

const Row = ({ icon, label, desc }: { icon: string; label: string; desc: string }) => (
  <div className="flex items-start gap-3 py-1.5 border-b border-white/5 last:border-0">
    <span className="text-base shrink-0 mt-0.5">{icon}</span>
    <div>
      <span className="text-xs font-bold text-white">{label}</span>
      <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
    </div>
  </div>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl px-3 py-2">
    <span className="text-sm shrink-0">💡</span>
    <p className="text-[11px] text-blue-300 leading-relaxed">{children}</p>
  </div>
);

/* ─── Help pages ──────────────────────────────────────────────── */

const ExercisesHelpPopup: React.FC<ExercisesHelpPopupProps> = ({ isOpen, onClose }) => {
  const helpPages = [

    /* ── PAGE 1 · Overview ─────────────────────────────────────── */
    {
      title: "Exercise Library — Overview",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            Your Exercise Library is the central hub for all movements in GymDay Fit. Browse hundreds of built-in exercises, create custom ones, filter by any attribute, and build multi-zone gym workouts — all in one place.
          </p>

          {/* Category Tiles */}
          <Section icon="🗂️" title="Exercise Categories" color="bg-indigo-500/10 border-indigo-500/20 text-indigo-200">
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: "🏋️", label: "Weights",       color: "bg-blue-500/15 border-blue-500/25 text-blue-300" },
                { icon: "🚴", label: "Cardio",         color: "bg-green-500/15 border-green-500/25 text-green-300" },
                { icon: "🤸", label: "No Equipment",   color: "bg-orange-500/15 border-orange-500/25 text-orange-300" },
                { icon: "🛷", label: "Slide Board",    color: "bg-purple-500/15 border-purple-500/25 text-purple-300" },
              ].map(c => (
                <div key={c.label} className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${c.color}`}>
                  <span className="text-base">{c.icon}</span>
                  <span className="text-[11px] font-bold">{c.label}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Stats strip */}
          <Section icon="📊" title="Stats Strip" color="bg-white/5 border-white/10 text-gray-200">
            <p className="text-[11px] text-gray-400">
              The colourful summary boxes at the top of the page show a real-time count of exercises in each category. Tap any box to instantly jump to that filter.
            </p>
          </Section>

          <Tip>All filters — My Gym, Visual Filters, and Dropdowns — can be combined. For example: "My Gym CF-A + Muscle Group Triceps" shows only CF-A triceps exercises.</Tip>
        </div>
      )
    },

    /* ── PAGE 2 · Visual Filters ───────────────────────────────── */
    {
      title: "Visual Filters",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            Three vibrant gateway cards sit below the My Gym panel. Each opens a beautiful full-screen picker so you can filter by image rather than dropdowns.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {[
              { emoji: "🔧", label: "Equipment",     color: "bg-cyan-500/15 border-cyan-500/25 text-cyan-300",     desc: "Dumbbell, Cable, Machine, Barbell…" },
              { emoji: "📁", label: "Category",      color: "bg-yellow-500/15 border-yellow-500/25 text-yellow-300", desc: "Weights, Cardio, Bodyweight…" },
              { emoji: "💪", label: "Muscle Group",  color: "bg-rose-500/15 border-rose-500/25 text-rose-300",     desc: "Chest, Back, Triceps, Legs…" },
            ].map(f => (
              <div key={f.label} className={`rounded-xl border p-2 text-center ${f.color}`}>
                <div className="text-2xl mb-1">{f.emoji}</div>
                <div className="text-[10px] font-black uppercase tracking-wider">{f.label}</div>
                <div className="text-[9px] text-gray-500 mt-1">{f.desc}</div>
              </div>
            ))}
          </div>

          <Section icon="👆" title="How to use" color="bg-white/5 border-white/10 text-gray-200">
            <div className="space-y-2">
              <Step num={1} color="bg-cyan-600 text-white">Tap any of the three filter cards (Equipment, Category, or Muscle Group).</Step>
              <Step num={2} color="bg-cyan-600 text-white">A centered popup opens showing all sub-options as colourful image tiles.</Step>
              <Step num={3} color="bg-cyan-600 text-white">Tap a tile — the library instantly filters to matching exercises. The popup closes.</Step>
              <Step num={4} color="bg-cyan-600 text-white">An active badge appears on the card to show the current filter. Tap again to change or clear it.</Step>
            </div>
          </Section>

          <Tip>Visual filters stack with the search bar and dropdown filters. Use all three together for laser-precise results.</Tip>
        </div>
      )
    },

    /* ── PAGE 3 · Search & Dropdown Filters ──────────────────────── */
    {
      title: "Search & Dropdown Filters",
      content: (
        <div className="space-y-4">
          <Section icon="🔍" title="Search Bar — Always Visible" color="bg-white/5 border-white/10 text-gray-200">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              The search bar is always at the top of the filter bar. It searches exercise names in real time as you type. The inline <strong className="text-white">✕</strong> button clears search instantly.
            </p>
          </Section>

          <Section icon="⚙️" title="Dropdown Filters (Collapsible)" color="bg-purple-500/10 border-purple-500/20 text-purple-200">
            <p className="text-[11px] text-gray-400 leading-relaxed mb-2">
              Tap the <Badge color="bg-purple-500/20 text-purple-300">Filters ⌄</Badge> button next to the search bar to reveal three dropdowns:
            </p>
            <div className="space-y-1">
              <Row icon="🔧" label="Equipment" desc="Filter by Dumbbell, Cable, Machine, Barbell, Kettlebell, etc." />
              <Row icon="📁" label="Category" desc="Filter by Weights, Cardio, Slide Board, No Equipment, or Favorites." />
              <Row icon="💪" label="Muscle Group" desc="Filter by Chest, Back, Biceps, Triceps, Shoulders, Legs, Core, and more." />
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              A numbered badge on the Filters button shows how many dropdowns are currently active. The global <strong className="text-white">✕</strong> clear button resets everything.
            </p>
          </Section>

          <Tip>The dropdown filters collapse by default to keep your screen clean. They exist as an alternative to the Visual Filters — use whichever feels faster for you.</Tip>
        </div>
      )
    },

    /* ── PAGE 4 · My Gym Filter ──────────────────────────────────── */
    {
      title: "My Gym Filter",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            The <Badge color="bg-amber-500/20 text-amber-300">📍 My Gym</Badge> button unlocks gym-based filtering. If you have set up gyms in the Custom Gym Builder, you can filter your exercise library by gym location and by individual zone (section) within that gym.
          </p>

          <Section icon="🏛️" title="How It Works" color="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <div className="space-y-2">
              <Step num={1} color="bg-amber-500 text-black">Tap <strong>My Gym</strong> to expand a panel listing all your saved gyms.</Step>
              <Step num={2} color="bg-amber-500 text-black">Tap a <strong>gym name</strong> to filter the entire library to exercises at that gym.</Step>
              <Step num={3} color="bg-amber-500 text-black">Expand the gym to see individual <strong>zones</strong> (e.g. CF-A — Arms, CF-B — Chest). Tap a zone to filter to just that area.</Step>
              <Step num={4} color="bg-amber-500 text-black">Tap the <strong>🏋 badge</strong> next to a zone to preview which exercises belong there — before and after migration.</Step>
            </div>
          </Section>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-2 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">Zone Preview</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Each zone shows the exercises it contains. Before you run the tagging migration, exercises are matched by <strong className="text-white">name prefix</strong> (e.g. "CFA…" appears under CF-A). After tagging they are properly linked. A footer note tells you which state the exercises are in.
            </p>
          </div>

          <Tip>Tap "Manage Gyms" (gear icon) to open the full Gym Builder without leaving the library. To tag your CF exercises to the right zones go to Settings → Library Utility.</Tip>
        </div>
      )
    },

    /* ── PAGE 5 · Multi-Zone Selection ──────────────────────────── */
    {
      title: "Multi-Zone Workout Selection",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            You can build a workout that spans <strong className="text-white">multiple zones of your gym</strong> in one session — without losing your picks when you switch areas.
          </p>

          <Section icon="🗺️" title="Step-by-Step" color="bg-green-500/10 border-green-500/20 text-green-200">
            <div className="space-y-3">
              <Step num={1} color="bg-green-600 text-white">
                Open <strong>My Gym → select CF-A — Arms</strong>. Enable selection mode (checkbox icon in toolbar). Tap the exercises you want from this area.
              </Step>
              <Step num={2} color="bg-green-600 text-white">
                Open <strong>My Gym again → select CF-E — Legs</strong>. The exercises you picked from CF-A stay visible at the top of the list, grouped under:
              </Step>
              <div className="ml-9 flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5">
                <span className="text-amber-400 text-xs font-black">✓ 3 picks from other zones</span>
              </div>
              <Step num={3} color="bg-green-600 text-white">
                Pick exercises from CF-E. The green <strong>"Start Workout"</strong> button at the top shows the running total across all zones.
              </Step>
              <Step num={4} color="bg-green-600 text-white">
                Repeat for as many zones as you need. When done, tap <strong>"Start Workout with N Exercises"</strong> to begin your multi-zone session.
              </Step>
            </div>
          </Section>

          <div className="rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-2 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-green-400">Visual Cue</p>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Exercises from <em>other</em> zones appear at the top with an amber divider line. Exercises from the <em>current</em> zone appear below a "Current zone" divider. You can deselect any exercise at any time from either group.
            </p>
          </div>

          <Tip>This works for ANY gym and ANY sections — not just Choice Fitness. Multi-zone selection is available to all users who set up zones in the Gym Builder.</Tip>
        </div>
      )
    },

    /* ── PAGE 6 · Editing an Exercise ───────────────────────────── */
    {
      title: "Editing an Exercise",
      content: (
        <div className="space-y-4">
          <p className="text-gray-400 text-xs leading-relaxed">
            Customise your library to match your training style. You can edit any exercise — whether it's a default movement or one you created yourself.
          </p>

          <Section icon="📝" title="The Editor" color="bg-blue-500/10 border-blue-500/20 text-blue-200">
            <div className="space-y-2">
              <Step num={1} color="bg-blue-600">Tap the <strong>pencil icon</strong> on any exercise card to open the editor.</Step>
              <Step num={2} color="bg-blue-600">Modify the <strong>Name</strong>, <strong>Category</strong>, and <strong>Muscle Groups</strong> to keep your data organized.</Step>
              <Step num={3} color="bg-blue-600">Use <strong>Instructions</strong> to record specific tips for that exercise.</Step>
            </div>
          </Section>

          <Section icon="📸" title="Range of Motion (2 Photos)" color="bg-amber-500/10 border-amber-500/20 text-amber-200">
            <p className="text-[11px] text-gray-400 mb-2">Upload two photos to see your form in action:</p>
            <div className="space-y-1">
              <Row icon="📁" label="Direct Upload" desc="Tap the upload area to pick photos from your phone or PC instantly." />
              <Row icon="📸" label="Start & End Pics" desc="Add a 'Before' (initial) and 'After' (peak) photo for proper form reference." />
              <Row icon="🔄" label="Animation Cycle" desc="During workouts, a 'Play' button will cycle your photos every 3 seconds." />
              <Row icon="⏩" label="Live Shortcuts" desc="Tap the pencil icon in the LIVE workout header to add photos mid-session." />
            </div>
          </Section>

          <Tip>Editing exercises during a workout is fully supported! Changes save immediately and update your active session.</Tip>
        </div>
      )
    },

    /* ── PAGE 7 · Managing Exercises ───────────────────────────── */
    {
      title: "Managing Exercises",
      content: (
        <div className="space-y-4">
          <Section icon="➕" title="Adding & Global Changes" color="bg-emerald-500/10 border-emerald-500/20 text-emerald-200">
            <div className="space-y-1">
              <Row icon="✏️" label="New Exercise" desc="Tap the + New Exercise button in the toolbar to create a custom exercise from scratch." />
              <Row icon="🔄" label="Sync Library" desc="The Sync Library button (↻ icon) pulls in any missing default movements from our cloud catalog." />
              <Row icon="🗑️" label="Delete" desc="Remove exercises by long-pressing or using the bin icon in the edit screen." />
            </div>
          </Section>

          <Section icon="⚡" title="Quick Actions" color="bg-white/5 border-white/10 text-gray-200">
            <div className="space-y-1">
              <Row icon="▶️" label="Start Single" desc="Starts a targeted workout with just this one exercise." />
              <Row icon="❤️" label="Favourite" desc="Pins the movement to your Favourites list for quick access." />
              <Row icon="📈" label="Progress" desc="Tap an exercise card to view your full volume and performance history graphs." />
            </div>
          </Section>

          <Tip>Marks your exercises as favourites to keep them grouped at the top of your library for faster planning.</Tip>
        </div>
      )
    },

    /* ── PAGE 8 · Toolbar & Pro Tips ──────────────────────────────── */
    {
      title: "Toolbar & Pro Tips",
      content: (
        <div className="space-y-4">
          <Section icon="🛠️" title="Toolbar Buttons (Top-Right)" color="bg-white/5 border-white/10 text-gray-200">
            <div className="space-y-1">
              <Row icon="📊" label="Stats" desc="Open the global analytics dashboard for all exercises." />
              <Row icon="☑️" label="Selection Mode" desc="Pick multiple exercises to build a new workout session." />
              <Row icon="🔁" label="Reorder Favourites" desc="Drag-and-drop to prioritise your custom shortlist." />
              <Row icon="📄" label="PDF Export" desc="Generate a professional PDF catalog of your entire exercise library." />
            </div>
          </Section>

          <Section icon="⭐" title="Pro Tips" color="bg-yellow-500/10 border-yellow-500/20 text-yellow-200">
            <ul className="space-y-2">
              {[
                "The search bar stays floating at the top — use it while scrolling for rapid lookups.",
                "Combine filters (e.g. Favourites + Chest) to find specific moves in seconds.",
                "Zones in the My Gym panel are color-coded to match your gym builder map.",
                "Deselect exercises at any time by tapping their checkbox even if the zone filter is off.",
                "Animation cycles pause automatically when you interact with the workout timer.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-yellow-200/80">
                  <span className="text-yellow-500 shrink-0 mt-0.5">✦</span>
                  {tip}
                </li>
              ))}
            </ul>
          </Section>
        </div>
      )
    },
  ];

  return (
    <ModernHelpDialog
      isOpen={isOpen}
      onClose={onClose}
      pages={helpPages}
      title="Exercise Library Help"
    />
  );
};

export default ExercisesHelpPopup;
