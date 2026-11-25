"use client"

import React from "react"
import { UserCircle2 } from "lucide-react"
import { useVitalsProfile, VitalsProfileData } from "@/lib/vitalsProfile"
import { HealthTooltip, FieldHelpPopover } from "./health-tooltip"

const inputCls =
  "h-7 rounded-md border border-white/15 bg-black/60 px-1.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-rose-500"

function SegBtn({ active, onClick, children, tip }: { active: boolean; onClick: () => void; children: React.ReactNode; tip: string }) {
  return (
    <HealthTooltip content={tip}>
      <button
        type="button"
        onClick={onClick}
        aria-pressed={active}
        className={`px-2 h-6 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
          active ? "bg-rose-500/25 text-rose-200 border border-rose-500/40" : "text-gray-400 hover:text-white border border-transparent"
        }`}
      >
        {children}
      </button>
    </HealthTooltip>
  )
}

export function ProfileAgeInput({ compact }: { compact?: boolean }) {
  const { profile, updateProfile, parsedAge } = useVitalsProfile()
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {!compact && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Age</span>}
      <HealthTooltip content="Your age in years (saved only on this device). Used by all Vitals references.">
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={125}
          value={profile.age}
          placeholder="--"
          aria-label="Age in years"
          onChange={(e) => updateProfile({ age: e.target.value })}
          className={`${inputCls} w-14`}
        />
      </HealthTooltip>
      {parsedAge === 0 && (
        <HealthTooltip content="For babies under 1 year, pick the age band so heart-rate and sleep rows are correct.">
          <select
            value={profile.infantAgeDetail}
            aria-label="Infant age detail"
            onChange={(e) => updateProfile({ infantAgeDetail: e.target.value as VitalsProfileData["infantAgeDetail"] })}
            className={`${inputCls} w-auto font-sans`}
            style={{ colorScheme: "dark" }}
          >
            <option value="0-4w">0 to 4 weeks</option>
            <option value="4w-3m">4 weeks to 3 months</option>
            <option value="4-12m">4 to 12 months</option>
          </select>
        </HealthTooltip>
      )}
    </span>
  )
}

export function ProfileSexToggle({ compact }: { compact?: boolean }) {
  const { profile, updateProfile } = useVitalsProfile()
  return (
    <span className="inline-flex items-center gap-1.5">
      {!compact && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sex</span>}
      <span role="group" aria-label="Sex" className="inline-flex rounded-md border border-white/15 bg-black/50 p-0.5">
        <SegBtn active={profile.sex === "male"} onClick={() => updateProfile({ sex: "male" })} tip="Use reference values for men">
          Male
        </SegBtn>
        <SegBtn active={profile.sex === "female"} onClick={() => updateProfile({ sex: "female" })} tip="Use reference values for women">
          Female
        </SegBtn>
      </span>
    </span>
  )
}

export function ProfileHeightInput({ compact }: { compact?: boolean }) {
  const { profile, updateProfile } = useVitalsProfile()
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      {!compact && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Height</span>}
      {profile.heightUnit === "ft_in" ? (
        <>
          <HealthTooltip content="Height: feet">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={8}
              value={profile.heightFt}
              placeholder="ft"
              aria-label="Height feet"
              onChange={(e) => updateProfile({ heightFt: e.target.value })}
              className={`${inputCls} w-11`}
            />
          </HealthTooltip>
          <HealthTooltip content="Height: inches">
            <input
              type="number"
              inputMode="decimal"
              min={0}
              max={11.9}
              value={profile.heightIn}
              placeholder="in"
              aria-label="Height inches"
              onChange={(e) => updateProfile({ heightIn: e.target.value })}
              className={`${inputCls} w-11`}
            />
          </HealthTooltip>
        </>
      ) : (
        <HealthTooltip content="Height in centimeters">
          <input
            type="number"
            inputMode="decimal"
            min={30}
            max={275}
            value={profile.heightCm}
            placeholder="cm"
            aria-label="Height centimeters"
            onChange={(e) => updateProfile({ heightCm: e.target.value })}
            className={`${inputCls} w-14`}
          />
        </HealthTooltip>
      )}
      <span role="group" aria-label="Height unit" className="inline-flex rounded-md border border-white/15 bg-black/50 p-0.5">
        <SegBtn active={profile.heightUnit === "ft_in"} onClick={() => updateProfile({ heightUnit: "ft_in" })} tip="Enter height in feet and inches">
          ft/in
        </SegBtn>
        <SegBtn active={profile.heightUnit === "cm"} onClick={() => updateProfile({ heightUnit: "cm" })} tip="Enter height in centimeters">
          cm
        </SegBtn>
      </span>
    </span>
  )
}

/** One small shared "My Profile" bar for the Vitals page (localStorage on this device only). */
export function VitalsProfileControl() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-200">
        <UserCircle2 className="h-4 w-4 text-rose-400" />
        My Profile
        <FieldHelpPopover
          title="My Profile (this device only)"
          content="Age, sex and height are shared by every Vitals reference panel, including Blood Pressure. They are saved only in this browser's local storage and are never sent to the server."
        />
      </span>
      <ProfileAgeInput />
      <ProfileSexToggle />
      <ProfileHeightInput />
      <span className="text-[10px] text-gray-500 ml-auto">Saved on this device only</span>
    </div>
  )
}
