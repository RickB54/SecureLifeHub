// STANDING RULE FOR FUTURE WORK:
// Every new feature (or changed feature) MUST have a Help entry in this file and accessible tooltips/popovers in the UI.

export interface HealthHelpStep {
  heading: string
  body: string
}

export interface HealthHelpSection {
  id: string
  title: string
  subtitle: string
  badgeColor: string
  keywords: string[]
  steps: HealthHelpStep[]
}

export const HEALTH_HUB_GUIDE_INTRO =
  "Plain-language guide to every screen, button, and workflow in the Health Hub. Search below or tap any section to expand."

export const HEALTH_HUB_HELP_SECTIONS: HealthHelpSection[] = [
  {
    id: "overview-tabs",
    title: "1. Health Hub Overview & Tabs",
    subtitle: "How the Health Hub is organized and what each tab does",
    badgeColor: "blue",
    keywords: [
      "overview",
      "tabs",
      "navigation",
      "medical history",
      "meds",
      "dr ai",
      "vitals",
      "doctors",
      "appointments",
      "timeline",
      "check-in",
    ],
    steps: [
      {
        heading: "Top Tab Bar & Mobile Menu",
        body: "On desktop, use the horizontal tab bar to jump between sections. On phones, use the compact dropdown at the top-left next to the green Doctor Visit Hub button.",
      },
      {
        heading: "Visit Hub & Quick Section Shortcuts",
        body: "The green Visit Hub chip opens the full-screen consultation workspace. The teal shortcut chips (Notes, Letters, Referrals, Questions, Visit Summary) open Visit Hub directly to that specific section.",
      },
      {
        heading: "Core Health Tabs",
        body: "Overview shows summary cards; Medical History stores lab/clinic records; Meds tracks prescriptions, categories, pill counts, and PDF exports; Dr. AI answers health questions; Vitals charts blood pressure, weight, and glucose; My Doctors manages doctors and facilities; Appointments manages upcoming and past visits; Timeline shows a monthly calendar; Check-in logs daily mood and symptoms.",
      },
    ],
  },
  {
    id: "doctor-visit-hub",
    title: "2. Doctor Visit Hub",
    subtitle: "Preparing for appointments, tracking items given to your doctor, and Visit Mode",
    badgeColor: "emerald",
    keywords: [
      "doctor visit hub",
      "section chips",
      "expand all",
      "collapse all",
      "edit pencil",
      "search",
      "sort",
      "filter",
      "given to doctor",
      "visit mode",
      "copy as text",
      "shortcut links",
    ],
    steps: [
      {
        heading: "Section Chips & All Button",
        body: "Tap the sticky chips under the header (Next Appt, Snapshot, Questions, Notes, Letters, Referrals, Visit Summary, Appointments) to show one or several sections at once. Tap All to display every section in order, or tap All again to collapse back to Next Appt.",
      },
      {
        heading: "Expand / Collapse All & Collapsed Cards",
        body: "Use the double-chevron icon in the top-right header to expand or collapse all sections and item cards at once. When a card is collapsed to a single line, tap the card to read it or tap the small edit pencil icon to edit immediately without expanding first.",
      },
      {
        heading: "Search, Sort & Filter Toolbars",
        body: "Each list section has its own search box, Doctor filter dropdown, Given status filter (All, Not given, Given), and Sort menu (Newest, Oldest, Doctor A–Z, Title A–Z).",
      },
      {
        heading: '"Given to Doctor" Tracking',
        body: "Expand any Note, Letter, Referral, or Visit Summary and check Given to doctor. Choose how you shared it (At visit or Via portal) and the date. Collapsed cards turn green with a Given badge so you never hand the same item twice.",
      },
      {
        heading: "Visit Mode & Copy as Text",
        body: "Tap the green Visit Mode button in the top-right to switch into a high-contrast, large-print read-only screen built to hand to your doctor or print. Use Print / PDF to print cleanly on white paper, or Copy as text to copy the summary into a patient portal message.",
      },
      {
        heading: "Section Shortcut Links",
        body: "Links like Go to full tab (Appointments), Go to Meds, My Doctors, and Medical History jump straight from Visit Hub to the full management tab when you need deeper edits.",
      },
    ],
  },
  {
    id: "notes-letters-referrals-questions-summary",
    title: "3. Notes, Letters, Referrals, Questions & Visit Summary",
    subtitle: "What belongs in each Doctor Visit Hub section and how attachments work",
    badgeColor: "teal",
    keywords: [
      "notes",
      "letters",
      "attachments",
      "pictures",
      "downsized",
      "compressed",
      "referrals",
      "questions",
      "visit summary",
    ],
    steps: [
      {
        heading: "Questions for Doctor",
        body: "Jot down questions before your appointment and link them to a specific doctor or facility. Tap the circle icon to check a question off once answered, and record the doctor's answer in Answer Notes.",
      },
      {
        heading: "Health Notes",
        body: "Keep clinical observations, symptom timelines, and pre-visit notes separate from general vault notes. Link each note to a doctor, facility, and date type (such as Appointment date or Symptom start).",
      },
      {
        heading: "Doctor Letters & Automatic Picture Downsizing",
        body: "Track clearance letters, records requests, and medical correspondence (Needed, Requested, Received, Sent). When you attach a photo of a paper letter, the app automatically downsizes and compresses the image before uploading so pages load fast and storage/egress stay minimal.",
      },
      {
        heading: "Referrals & Specialists",
        body: "Track specialist referrals from Needed -> Requested -> Scheduled -> Seen, including the referring doctor, target specialist, facility, phone number, and reason.",
      },
      {
        heading: "Visit Summary",
        body: "Paste or type after-visit instructions, medication changes, or portal encounter recaps in the Visit Summary clinical box. You can copy any summary as plain text in one tap.",
      },
    ],
  },
  {
    id: "doctors-and-facilities",
    title: "4. My Doctors & Medical Facilities",
    subtitle: "Linking providers and hospitals/clinics, auto-fill dropdowns, and one-tap facility import",
    badgeColor: "rose",
    keywords: [
      "my doctors",
      "facilities",
      "hospitals",
      "clinics",
      "pharmacies",
      "linking",
      "create facilities from existing doctors",
      "portal",
    ],
    steps: [
      {
        heading: "Doctors & Facilities Sub-Tabs",
        body: "Open My Doctors in the Health Hub to switch between Doctors (providers and specialists) and Facilities (hospitals, clinics, labs, imaging centers, and pharmacies).",
      },
      {
        heading: "Linking Doctors and Facilities",
        body: "When adding or editing a doctor, select zero, one, or multiple Linked Facilities. You can also link doctors from inside a Facility form. Tapping a facility badge on a doctor card jumps straight to that facility.",
      },
      {
        heading: "Smart Doctor & Facility Dropdowns",
        body: "Across Medications, Appointments, and Visit Hub, selecting a doctor who is linked to a single facility automatically fills in the Facility field for you (while still letting you change or clear it).",
      },
      {
        heading: '"Create Facilities from Existing Doctors"',
        body: "In the Facilities sub-tab, tap Create facilities from existing doctors to automatically build facility records from facility names already typed on your doctors and link them together without duplicates.",
      },
    ],
  },
  {
    id: "appointments",
    title: "5. Appointments & Google Calendar",
    subtitle: "Scheduling medical visits, relative countdown badges, and optional Google Calendar view",
    badgeColor: "indigo",
    keywords: [
      "appointments",
      "visits",
      "schedule",
      "google calendar",
      "upcoming",
      "past",
      "notes",
    ],
    steps: [
      {
        heading: "Scheduling & Editing Appointments",
        body: "Tap Schedule Appointment to enter the visit title/reason, date and time, doctor, facility, specialty, location, and arrival instructions. Cards show relative badges like Today, Tomorrow, or in 10 days.",
      },
      {
        heading: "Filtering, Sorting & Past Visits",
        body: "Use the search box, the All / Upcoming / Past toggle, and the Sort menu (Soonest first, Latest first, Doctor A–Z). Past visits stay neatly tucked inside a collapsible Past appointments section below your upcoming cards.",
      },
      {
        heading: "Expanding Appointment Notes",
        body: "Long arrival instructions (such as fasting or check-in steps) stay truncated to one clean line on the card — tap the small (i) icon next to the note to expand the full text.",
      },
      {
        heading: "Optional Google Calendar Connection",
        body: "Use the compact Connect Google Calendar bar if you want to view upcoming Google Calendar events alongside your Health Hub appointments. Disconnecting revokes access at any time.",
      },
    ],
  },
  {
    id: "vitals-bp-reference",
    title: "6. Vitals, My Profile & Reference Ranges",
    subtitle: "Vital sign trends, shared My Profile, Blood Pressure Reference, and reference panels for every vital",
    badgeColor: "rose",
    keywords: [
      "vitals",
      "blood pressure",
      "bp",
      "reference",
      "chart",
      "systolic",
      "diastolic",
      "hypertension",
      "normal",
      "elevated",
      "stage 1",
      "stage 2",
      "severe",
      "age",
      "sex",
      "aha",
      "nhanes",
      "90/60",
      "my profile",
      "height",
      "weight",
      "bmi",
      "temperature",
      "fever",
      "blood oxygen",
      "spo2",
      "heart rate",
      "exercise zones",
      "glucose",
      "fasting",
      "a1c",
      "sleep",
      "sleep score",
      "water",
      "calories",
      "steps",
      "activity",
      "units",
    ],
    steps: [
      {
        heading: "Opening the Blood Pressure Reference Chart",
        body: "On the Vitals tab, find the Blood Pressure card and tap the Blood Pressure Reference bar (or the small chart icon next to BLOOD PRESSURE). It stays collapsed by default so your Vitals dashboard stays compact, and uses zero network or database queries.",
      },
      {
        heading: "Age & Sex Controls (Saved Only on This Device)",
        body: "Enter your Age (18 and older for adult data) and choose Male or Female. Your selection is saved only in localStorage on this browser/device. For ages under 18, no adult numbers are shown because pediatric blood pressure depends on age, sex, and height percentiles.",
      },
      {
        heading: "Part A: Goal Categories (2025 AHA/ACC Adult Guideline)",
        body: "Goal categories are the same for all adults regardless of age or sex: Normal (<120 AND <80), Elevated (120–129 AND <80), Stage 1 hypertension (130–139 OR 80–89), Stage 2 hypertension (140+ OR 90+), and Severe (>180 and/or >120). Your most recent logged blood pressure reading is automatically marked using the higher category when systolic and diastolic fall in different tiers. Readings below about 90/60 may be low — tell your doctor if you feel dizzy or faint.",
      },
      {
        heading: "Part B: Typical Survey Readings vs Clinical Target",
        body: "Part B shows typical middle range (25th–75th percentile), average (mean and median), and usual full range (5th–95th percentile) measured in US adults without high blood pressure (CDC/NCHS Report No. 35, NHANES 2001–2008). These typical readings describe what adults in that age/sex group measured — they are NOT a target. The clinical goal for all adults remains the Normal category, and reference charts are never a medical diagnosis.",
      },
      {
        heading: "My Profile (Shared Age, Sex & Height)",
        body: "The small My Profile bar at the top of Vitals holds your age, sex and height (ft/in or cm). Every reference panel, including Blood Pressure, uses these same values. They are saved only in this browser's local storage and never sent anywhere. If a panel needs a value you have not entered, it shows a small inline prompt where you can fill it in.",
      },
      {
        heading: "Reference Panels on Every Vital Card",
        body: "Each vital card (Weight, Temperature, Blood Oxygen, Heart Rate, Glucose, Sleep Duration, Sleep Score, Water Intake, Calorie Intake, Steps, Activity) has a collapsed Reference bar and a small chart icon. Open it to see color-coded bands (green = in range, yellow = borderline, orange = needs attention, red = get care), a marker for your latest logged value, a one-line verdict, notes and the source. The verdict also appears as a small colored chip on the card. With no entries, only the reference is shown. Everything uses vitals already on screen; nothing is downloaded.",
      },
      {
        heading: "Units Are Converted Before Comparing",
        body: "Readings are converted before comparing (lb/kg, °F/°C, mmol/L to mg/dL, and oz/mL/L/cups) and shown in the unit you logged.",
      },
      {
        heading: "Weight (BMI), Temperature, Blood Oxygen & Heart Rate",
        body: "Weight uses BMI from your latest weight and profile height (CDC bands for adults 20+), plus your healthy weight range (BMI 18.5 to 24.9) and how far you are from it; under 20 it only shows a pediatric note. Temperature uses oral bands in °F and °C. Blood Oxygen uses SpO2 bands (95 to 100% normal). Heart Rate picks the normal resting range for your age, and adults see exercise zones based on about 220 minus age.",
      },
      {
        heading: "Glucose Context & A1C Table",
        body: "Glucose is compared by context: Fasting, 2 hours after eating, or Random. Choose the context in the Log Vital form's State/Context menu (Glucose group). For older entries with no context, pick one inside the Glucose Reference panel (saved on this device only). Under 70 is always flagged as low. An A1C reference table is shown for lab results.",
      },
      {
        heading: "Sleep, Water, Calories, Steps & Activity",
        body: "Sleep Duration compares your latest night and 7-night average to the recommended hours for your age. Sleep Score labels are approximate and device-specific, compared with your own 7-day average. Water compares your latest day's beverages to the adequate intake for your sex. Calories compare your latest day's total to the Dietary Guidelines range for your age, sex and chosen Activity level. Steps uses informal tiers plus your 7-day average. Activity totals this week (Monday to Sunday) against the 150 to 300 minute weekly goal.",
      },
    ],
  },
  {
    id: "medications",
    title: "7. Medications (Meds), Pill Counts, Categories & Quick Import",
    subtitle: "Complete guide to tracking prescriptions, pill estimates, categories, and importing",
    badgeColor: "purple",
    keywords: [
      "medications",
      "meds",
      "track pill count",
      "pills per dose",
      "count starts",
      "refill",
      "skip",
      "take",
      "reset",
      "info",
      "detail",
      "med info",
      "categories",
      "manage categories",
      "rx quick import",
      "preset",
      "pill library",
    ],
    steps: [
      {
        heading: "Adding a Medication, Duplicate Check & Pill Library",
        body: "Tap + Add Med to save a medication's name, strength/dosage, form (tablet, capsule, inhaler, etc.), category, schedule, prescriber, pharmacy details, Rx number, and pill shape/color. If a medication with the same name and strength is already in your list, an 'Already in your list' banner lets you choose Open existing (to edit it instead of creating a copy) or Add anyway. You can also use Pill Library to preview pill shapes/colors and quick-add a drug.",
      },
      {
        heading: "Track Pill Count & How the Estimate Works",
        body: "Turn on Track pill count in Add/Edit Med when you want automatic remaining-pill and run-out estimates. Enter Pills per dose, Current Quantity, and Low-Stock Alert. Choose Count starts: Now (subtracts today's upcoming scheduled doses once their time passes), After today's dose (starts subtracting tomorrow because you already took today's), or Tomorrow. Scheduled meds drop automatically at each reminder time with zero background database traffic; As-Needed meds only drop when you tap Take.",
      },
      {
        heading: "Recording a Refill or Correcting the Count",
        body: "When you pick up a new bottle, tap Refill on the medication card or detail screen and enter the new pill count — this resets your count baseline to today. To manually fix a count at any time, open Edit (pencil icon), change Current Quantity, and save.",
      },
      {
        heading: "Skip, Take, Reschedule & Reset",
        body: "Tap Take to log a dose, Skip to skip a scheduled dose (skipped doses are not subtracted from your pill count), or Reschedule to set a one-off reminder time. Tap Reset on the card to undo today's logged status back to Not taken.",
      },
      {
        heading: "Info (i) Detail Screen, Official FDA Label Lookup & Safe Fill Fields",
        body: "Tap the teal Info (i) icon on any card to open the full-screen clinical sheet showing every saved field and your adherence log. Tap the blue sparkles icon (or Look up Drug Info in Add/Edit) to fetch official FDA & DailyMed drug labels for ANY medication (searching generic name first, then brand name, cached locally in your browser for 7 days). If multiple labels match, pick the manufacturer/date from the list; tap Show more on any trimmed section to read full FDA wording or open the DailyMed link. Tap Fill fields to preview checkboxes for Generic name, Drug class, Purpose, Common side effects, and Drug interactions — only checked items are copied into the open form, never touching your dose/schedule and never saving until you click Update/Add Medication.",
      },
      {
        heading: "Categories & Manage Categories",
        body: "Assign each medication a Category (such as Every Day Usage, As Needed, Surgery, Short-term / Temporary, Supplements, or + New category... to create your own). Filter the Meds list with the Category dropdown, and tap Manage categories to rename a category (updates every med using it) or delete one (safely moves its meds to Uncategorized).",
      },
      {
        heading: "Rx Quick Import: Built-In Preset Groups vs Your Categories",
        body: "Tap Import Rx to pick from built-in template groups (Severe Rash, Cold Medicine, Pain Relief, Antihistamines). Built-in groups are starter templates; the Assign medication category dropdown in the footer defaults to that group's name (e.g. Pain Relief) unless you pick another category or manage categories right there. Imported meds start safe with Track pill count OFF and no reminder alarms unless defined. If a drug with the same name and strength is marked Already in your list, it is skipped by default unless you switch duplicates to Update category.",
      },
    ],
  },
  {
    id: "exporting-pdfs",
    title: "8. Exporting PDFs, Printing & Copy as Text",
    subtitle: "Quick Reference vs Full Details, picking medications, and plain-text sharing",
    badgeColor: "amber",
    keywords: [
      "export",
      "pdf",
      "print",
      "quick reference",
      "full details",
      "by category",
      "pick medications",
      "copy as text",
      "patient name",
      "private notes",
    ],
    steps: [
      {
        heading: "Opening the Export Dialog",
        body: "Tap the Printer or Download PDF icon at the top of the Meds page to export from your full list, or tap them inside a medication's Info (i) detail screen or Edit form to export just that single drug.",
      },
      {
        heading: "Quick Reference vs Full Details",
        body: "Quick Reference creates a compact 1-page Letter table with only what a doctor or pharmacist needs for refills (drug/generic name, strength, form, directions, purpose, prescriber, pharmacy, Rx #, refills, last filled). Full Details starts with a summary table followed by one complete clinical sheet per medication.",
      },
      {
        heading: "Choosing Medications & Grouping",
        body: "Choose All medications, By category (multi-select categories), or Pick medications (searchable checklist of every medication in your vault, including imported and unscheduled ones). Leave Group by category ON to organize drugs under category headings, and optionally enter a Patient Name (remembered only on this device).",
      },
      {
        heading: "Privacy Toggles & Copy as Text",
        body: "In Full Details, Private Notes are OFF by default so personal notes stay private unless you check Include private notes. Tap Download PDF to save a crisp Letter PDF, Print to open a print-ready view, or Copy as text to paste a clean plain-text list into a pharmacy or portal message.",
      },
    ],
  },
  {
    id: "security-locks",
    title: "9. Security, Module Access Locks & PIN",
    subtitle: "Protecting Health Hub with a PIN lock and changing the default 1234 PIN",
    badgeColor: "cyan",
    keywords: [
      "security",
      "pin",
      "1234",
      "lock",
      "module access",
      "settings",
      "auto-lock",
    ],
    steps: [
      {
        heading: "Module Access Locks",
        body: "You can require a 4-digit PIN before opening Health Hub (including Doctor Visit Hub) while leaving other hub modules unlocked.",
      },
      {
        heading: "Default PIN (1234) & How to Change It",
        body: "The default module PIN is 1234. To turn the lock on/off or change your PIN, click the Settings gear in the top header -> Module Access, toggle Health Records lock ON, and enter your new custom PIN.",
      },
      {
        heading: "Vault Auto-Lock Timer",
        body: "The countdown badge in the top header shows when your entire Secure Life Hub session will auto-lock due to inactivity. Click the timer badge at any time to reset the countdown, or adjust the timeout in Settings -> Security.",
      },
    ],
  },
  {
    id: "tips-troubleshooting",
    title: "10. Helpful Tips & Troubleshooting",
    subtitle: "Clinical safety reminders and refreshing cached screens",
    badgeColor: "slate",
    keywords: [
      "tips",
      "estimates",
      "verify",
      "pharmacist",
      "doctor",
      "refresh",
      "hard refresh",
      "restart",
      "cache",
      "old screen",
    ],
    steps: [
      {
        heading: "Estimates Are Estimates",
        body: "Remaining pill counts, low-stock badges, and run-out dates are automatic client-side estimates based on your schedule. Always check your physical bottle before ordering refills.",
      },
      {
        heading: "Verify With Your Pharmacist or Doctor",
        body: "Preset templates, AI drug lookups, and exported medication sheets are informational tools only. Always verify dosages, instructions, and interactions with your pharmacist or physician.",
      },
      {
        heading: "If a Screen Looks Old (Hard-Refresh or Restart)",
        body: "If you update the app and a page still shows an older layout, press Ctrl + Shift + R (Windows/Linux) or Cmd + Shift + R (Mac) to hard-refresh the browser cache. On phones or installed PWA windows, close the tab/app completely and reopen it.",
      },
    ],
  },
]
