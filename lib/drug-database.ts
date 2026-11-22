export interface DrugInfo {
    name: string
    genericName: string
    brandNames: string[]
    drugClass: string
    uses: string[]
    sideEffects: {
        common: string[]
        serious: string[]
    }
    interactions: string[]
    warnings: string[]
    pregnancy: string
    mechanism: string
    verifiedNote: string
}

export const DRUG_DATABASE: Record<string, DrugInfo> = {
    zolpidem: {
        name: "Zolpidem",
        genericName: "Zolpidem tartrate",
        brandNames: ["Ambien", "Ambien CR", "Edluar", "Intermezzo", "Zolpimist"],
        drugClass: "Sedative-hypnotic (Non-benzodiazepine GABA-A receptor positive modulator)",
        uses: [
            "Short-term treatment of insomnia (difficulty falling asleep)",
            "Management of sleep onset latency and nighttime awakenings",
            "Short-term therapeutic sleep assistance under medical supervision"
        ],
        sideEffects: {
            common: [
                "Drowsiness and next-day somnolence",
                "Dizziness and lightheadedness",
                "Headache",
                "Nausea and digestive upset",
                "Dry mouth",
                "Grogginess or daytime fatigue"
            ],
            serious: [
                "Complex sleep behaviors (sleepwalking, sleep-driving, sleep-eating with subsequent amnesia)",
                "Severe allergic reactions / anaphylaxis and angioedema",
                "Central nervous system depression and respiratory depression",
                "Abnormal thinking, behavioral changes, and agitation",
                "Worsening depression or emergence of suicidal thoughts",
                "Tolerance, dependence, or rebound insomnia upon abrupt cessation"
            ]
        },
        interactions: [
            "Alcohol (severely compounds CNS depression and complex sleep behaviors)",
            "Opioids, benzodiazepines, and other prescription sedatives / sleep aids",
            "Strong CYP3A4 inhibitors (ketoconazole, itraconazole, clarithromycin)",
            "Strong CYP3A4 inducers (rifampin, carbamazepine, St. John's wort)",
            "SSRIs and other antidepressants (sertraline, fluoxetine)"
        ],
        warnings: [
            "BOXED WARNING: Complex sleep behaviors including sleepwalking, sleep-driving, and engaging in other activities while not fully awake can cause serious injury or death. Discontinue immediately if experienced.",
            "Take only immediately before bedtime with at least 7 to 8 hours remaining before awakening.",
            "Do not consume with alcohol or other CNS depressants.",
            "May impair alertness and reaction time the following morning; avoid driving until fully awake.",
            "Verify with your pharmacist or doctor before taking or modifying this medication."
        ],
        pregnancy: "Pregnancy Category C. Zolpidem is excreted into breast milk. Use only if clearly needed and directed by a physician.",
        mechanism: "Zolpidem selectively binds with high affinity to the alpha-1 subunit of the GABA-A receptor complex, potentiating inhibitory GABAergic transmission in the central nervous system to induce sedation and promote sleep.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    ambien: {
        name: "Ambien (Zolpidem)",
        genericName: "Zolpidem tartrate",
        brandNames: ["Ambien", "Ambien CR", "Edluar", "Intermezzo"],
        drugClass: "Sedative-hypnotic (Non-benzodiazepine GABA-A receptor modulator)",
        uses: [
            "Short-term treatment of insomnia (sleep initiation difficulty)",
            "Reduction in time to sleep onset"
        ],
        sideEffects: {
            common: ["Drowsiness", "Dizziness", "Headache", "Grogginess", "Nausea", "Dry mouth"],
            serious: ["Complex sleep behaviors (sleepwalking, sleep-driving)", "Severe allergic reactions", "Respiratory depression", "Memory amnesia", "Mood changes"]
        },
        interactions: ["Alcohol", "Opioids", "Benzodiazepines", "CYP3A4 inhibitors/inducers", "Antidepressants"],
        warnings: [
            "BOXED WARNING: Complex sleep behaviors can cause serious injuries. Stop taking if sleep-driving or sleepwalking occurs.",
            "Take only right before bed when 7-8 hours of sleep are available.",
            "Do not drink alcohol while taking Ambien.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category C. Consult healthcare provider.",
        mechanism: "Selective alpha-1 GABA-A receptor agonist causing CNS sedation and sleep initiation.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    lisinopril: {
        name: "Lisinopril",
        genericName: "Lisinopril",
        brandNames: ["Prinivil", "Zestril", "Qbrelis"],
        drugClass: "ACE (Angiotensin-Converting Enzyme) Inhibitor",
        uses: [
            "Treatment of hypertension (high blood pressure) to reduce cardiovascular risk",
            "Adjunctive management of heart failure",
            "Improvement of survival in patients following acute myocardial infarction (heart attack)"
        ],
        sideEffects: {
            common: ["Persistent dry cough", "Dizziness / lightheadedness", "Headache", "Excessive fatigue"],
            serious: ["Angioedema (swelling of face, lips, tongue, or airway)", "Hyperkalemia (high blood potassium)", "Acute kidney injury", "Severe hypotension"]
        },
        interactions: ["Potassium supplements and potassium-sparing diuretics", "NSAIDs (ibuprofen, naproxen)", "Lithium", "Other antihypertensive medications"],
        warnings: [
            "BOXED WARNING: Fetal toxicity; discontinue immediately if pregnancy is detected.",
            "Seek emergency medical attention if swelling of face, lips, throat, or difficulty breathing occurs (angioedema).",
            "Regular monitoring of blood pressure, serum potassium, and renal function is advised."
        ],
        pregnancy: "Contraindicated in pregnancy (Boxed Warning: Risk of fetal death and neonatal renal failure).",
        mechanism: "Inhibits angiotensin-converting enzyme, preventing the conversion of angiotensin I to angiotensin II, leading to vasodilation, decreased aldosterone secretion, and lowered systemic blood pressure.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    atorvastatin: {
        name: "Atorvastatin",
        genericName: "Atorvastatin calcium",
        brandNames: ["Lipitor"],
        drugClass: "HMG-CoA Reductase Inhibitor (Statin)",
        uses: [
            "Reduction of elevated LDL cholesterol, total cholesterol, and triglycerides",
            "Prevention of cardiovascular events (heart attack, stroke, angina) in high-risk patients",
            "Management of primary hyperlipidemia and dyslipidemia"
        ],
        sideEffects: {
            common: ["Joint or muscle aches (myalgia)", "Diarrhea", "Nasopharyngitis", "Mild indigestion"],
            serious: ["Rhabdomyolysis (severe muscle breakdown with dark urine)", "Hepatotoxicity (elevated liver enzymes)", "Marked hyperglycemia"]
        },
        interactions: ["Grapefruit and grapefruit juice", "Strong CYP3A4 inhibitors (clarithromycin, itraconazole)", "Cyclosporine", "Gemfibrozil and other fibrates"],
        warnings: [
            "Promptly report unexplained muscle pain, tenderness, or weakness, especially if accompanied by malaise or fever.",
            "Liver function tests may be indicated prior to and during therapy."
        ],
        pregnancy: "Contraindicated in pregnancy and nursing mothers.",
        mechanism: "Competitively inhibits HMG-CoA reductase, the rate-limiting enzyme in cholesterol biosynthesis, upregulating hepatic LDL receptors to enhance LDL clearance from plasma.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    metformin: {
        name: "Metformin",
        genericName: "Metformin hydrochloride",
        brandNames: ["Glucophage", "Glucophage XR", "Fortamet", "Glumetza"],
        drugClass: "Biguanide Antidiabetic Agent",
        uses: [
            "First-line treatment of type 2 diabetes mellitus to improve glycemic control",
            "Reduction of hepatic glucose output and improvement in insulin sensitivity"
        ],
        sideEffects: {
            common: ["Diarrhea", "Nausea and vomiting", "Abdominal bloating and flatulence", "Metallic taste"],
            serious: ["Lactic acidosis (rare but life-threatening metabolic emergency)", "Vitamin B12 deficiency with long-term use"]
        },
        interactions: ["Iodinated radiocontrast agents (temporarily withhold before contrast procedures)", "Excessive alcohol consumption", "Cimetidine", "Carbonic anhydrase inhibitors"],
        warnings: [
            "BOXED WARNING: Lactic acidosis risk increases in patients with renal impairment, sepsis, acute heart failure, or severe dehydration.",
            "Take with meals to minimize gastrointestinal discomfort."
        ],
        pregnancy: "Consult physician. Frequently used in gestational diabetes under specialist guidance.",
        mechanism: "Decreases hepatic glucose production, decreases intestinal absorption of glucose, and improves insulin sensitivity by increasing peripheral glucose uptake and utilization.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    prednisone: {
        name: "Prednisone",
        genericName: "Prednisone",
        brandNames: ["Deltasone", "Rayos"],
        drugClass: "Systemic Glucocorticoid / Corticosteroid",
        uses: [
            "Treatment of acute inflammatory disorders, allergic reactions, and asthma exacerbations",
            "Management of autoimmune diseases (rheumatoid arthritis, lupus, inflammatory bowel disease)"
        ],
        sideEffects: {
            common: ["Insomnia / restlessness", "Increased appetite and weight gain", "Fluid retention", "Elevated blood glucose", "Mood lability"],
            serious: ["Adrenal suppression upon abrupt cessation", "Immunosuppression and increased infection risk", "Peptic ulcer disease / GI bleeding", "Osteoporosis with prolonged therapy"]
        },
        interactions: ["NSAIDs (increased gastrointestinal bleeding risk)", "Live vaccines (immunosuppression)", "Blood glucose-lowering agents", "Warfarin"],
        warnings: [
            "Do not discontinue abruptly if taken for more than a few days; requires medical tapering to prevent adrenal insufficiency.",
            "Take in the morning with food to align with natural cortisol rhythm and reduce gastric irritation."
        ],
        pregnancy: "Category C. Weigh maternal benefit against potential fetal risk.",
        mechanism: "Binds to intracellular glucocorticoid receptors, modulating gene transcription to inhibit inflammatory cytokine synthesis and suppress cellular immune responses.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    hydroxyzine: {
        name: "Hydroxyzine",
        genericName: "Hydroxyzine hydrochloride / pamoate",
        brandNames: ["Atarax", "Vistaril"],
        drugClass: "First-generation Histamine H1 Receptor Antagonist / Anxiolytic",
        uses: [
            "Relief of anxiety and tension associated with psychoneurosis",
            "Symptomatic management of pruritus (itching) due to allergic conditions such as chronic urticaria",
            "Sedative premedication prior to anesthesia or dental procedures"
        ],
        sideEffects: {
            common: ["Dry mouth", "Drowsiness", "Sedation", "Fatigue", "Headache"],
            serious: ["QT interval prolongation / cardiac arrhythmias", "Severe central nervous system depression", "Seizures (at high doses)"]
        },
        interactions: ["CNS depressants (alcohol, barbiturates, opioids)", "QT-prolonging medications (amiodarone, citalopram)", "Anticholinergic agents"],
        warnings: [
            "May cause significant drowsiness; avoid operating motor vehicles or hazardous machinery.",
            "Avoid concomitant use with other QT-prolonging drugs or alcohol."
        ],
        pregnancy: "Contraindicated in early pregnancy. Consult physician.",
        mechanism: "Competitively antagonizes peripheral and central H1 histamine receptors and suppresses subcortical activity in the central nervous system.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    loratadine: {
        name: "Loratadine",
        genericName: "Loratadine",
        brandNames: ["Claritin", "Alavert"],
        drugClass: "Second-generation Non-sedating Antihistamine",
        uses: [
            "Relief of symptoms of seasonal allergic rhinitis (sneezing, runny nose, itchy/watery eyes)",
            "Treatment of uncomplicated skin manifestations of chronic idiopathic urticaria (hives)"
        ],
        sideEffects: {
            common: ["Headache", "Fatigue", "Dry mouth", "Mild drowsiness (infrequent at standard doses)"],
            serious: ["Severe hypersensitivity reactions", "Tachycardia or palpitations (rare)"]
        },
        interactions: ["Strong CYP3A4 / CYP2D6 inhibitors (ketoconazole, erythromycin) may increase serum levels"],
        warnings: [
            "Does not typically cause drowsiness at recommended doses, but individuals sensitive to antihistamines should exercise caution.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category B. Generally considered compatible when clinically necessary.",
        mechanism: "Selectively antagonizes peripheral histamine H1 receptors without penetrating the blood-brain barrier significantly.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    cetirizine: {
        name: "Cetirizine",
        genericName: "Cetirizine hydrochloride",
        brandNames: ["Zyrtec"],
        drugClass: "Second-generation Antihistamine",
        uses: [
            "Relief of allergy symptoms (hay fever, seasonal and perennial allergic rhinitis)",
            "Management of chronic idiopathic urticaria (hives and itching)"
        ],
        sideEffects: {
            common: ["Mild drowsiness", "Dry mouth", "Fatigue", "Headache"],
            serious: ["Severe allergic reactions / anaphylaxis", "Difficulty urinating / urinary retention"]
        },
        interactions: ["Alcohol and CNS depressants (may amplify drowsiness)"],
        warnings: [
            "May cause more drowsiness than other second-generation antihistamines; use caution before driving.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category B. Consult healthcare provider.",
        mechanism: "Potent, selective peripheral H1-receptor antagonist inhibiting histamine-mediated allergic reactions.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    famotidine: {
        name: "Famotidine",
        genericName: "Famotidine",
        brandNames: ["Pepcid", "Pepcid AC"],
        drugClass: "Histamine H2-Receptor Antagonist (H2RA)",
        uses: [
            "Treatment and prevention of heartburn, acid indigestion, and sour stomach",
            "Short-term treatment of active duodenal ulcers and benign gastric ulcers",
            "Management of gastroesophageal reflux disease (GERD) and pathological hypersecretory conditions"
        ],
        sideEffects: {
            common: ["Headache", "Dizziness", "Constipation or diarrhea"],
            serious: ["Arrhythmias / QT prolongation (in renal impairment)", "Central nervous system disturbances in elderly patients"]
        },
        interactions: ["Medications requiring gastric acidity for absorption (ketoconazole, atazanavir, iron salts)"],
        warnings: [
            "Dosage adjustment is recommended for patients with moderate-to-severe renal impairment.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category B. Generally considered safe under medical supervision.",
        mechanism: "Competitively inhibits histamine at H2 receptors of the gastric parietal cells, resulting in a marked reduction in gastric acid secretion and volume.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    ibuprofen: {
        name: "Ibuprofen",
        genericName: "Ibuprofen",
        brandNames: ["Advil", "Motrin"],
        drugClass: "Nonsteroidal Anti-inflammatory Drug (NSAID)",
        uses: [
            "Relief of mild to moderate pain, inflammation, and headache",
            "Fever reduction (antipyretic)",
            "Symptomatic management of dysmenorrhea, osteoarthritis, and rheumatoid arthritis"
        ],
        sideEffects: {
            common: ["Dyspepsia / stomach upset", "Nausea", "Mild abdominal pain", "Heartburn"],
            serious: ["Gastrointestinal ulceration and bleeding", "Cardiovascular thrombotic events (heart attack, stroke)", "Renal impairment / acute kidney injury"]
        },
        interactions: ["Blood thinners (warfarin, apixaban)", "Other NSAIDs or aspirin", "ACE inhibitors and ARBs", "Corticosteroids"],
        warnings: [
            "BOXED WARNING: Risk of serious cardiovascular thrombotic events and gastrointestinal bleeding / ulceration.",
            "Take with food or milk to minimize gastrointestinal discomfort.",
            "Avoid in third trimester of pregnancy due to premature closure of fetal ductus arteriosus."
        ],
        pregnancy: "Avoid especially during third trimester (risk of premature closure of ductus arteriosus).",
        mechanism: "Reversibly inhibits cyclooxygenase enzymes (COX-1 and COX-2), decreasing prostaglandin synthesis responsible for pain, fever, and inflammation.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    acetaminophen: {
        name: "Acetaminophen",
        genericName: "Acetaminophen / Paracetamol",
        brandNames: ["Tylenol", "Mapap"],
        drugClass: "Analgesic and Antipyretic",
        uses: [
            "Temporary relief of mild to moderate aches, pains, headaches, and toothaches",
            "Fever reduction"
        ],
        sideEffects: {
            common: ["Generally well tolerated at therapeutic doses", "Occasional mild nausea"],
            serious: ["Acute liver failure / severe hepatotoxicity (especially with doses exceeding 3,000–4,000 mg/day or alcohol abuse)", "Severe skin reactions (Stevens-Johnson syndrome)"]
        },
        interactions: ["Chronic heavy alcohol use", "Warfarin (at high regular doses)", "Other acetaminophen-containing combination products"],
        warnings: [
            "BOXED WARNING: Severe liver damage may occur if you take more than 4,000 mg in 24 hours or consume 3 or more alcoholic drinks daily.",
            "Carefully check all over-the-counter and prescription labels to avoid accidental acetaminophen overdose."
        ],
        pregnancy: "Considered the preferred analgesic/antipyretic in pregnancy when used at the lowest effective dose under physician advice.",
        mechanism: "Centrally inhibits prostaglandin synthesis and acts on hypothalamic heat-regulating centers; lacks peripheral anti-inflammatory effects.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    aspirin: {
        name: "Aspirin",
        genericName: "Acetylsalicylic acid",
        brandNames: ["Bayer Aspirin", "Ecotrin", "Bufferin"],
        drugClass: "Salicylate NSAID / Antiplatelet Agent",
        uses: [
            "Secondary prevention of cardiovascular events (myocardial infarction, transient ischemic attack, ischemic stroke)",
            "Relief of mild to moderate pain, fever, and inflammation"
        ],
        sideEffects: {
            common: ["Stomach irritation", "Heartburn", "Mild bruising or bleeding tendency"],
            serious: ["Gastrointestinal bleeding and peptic ulcers", "Tinnitus (at elevated doses)", "Anaphylaxis / bronchospasm in aspirin-sensitive asthma", "Reye's syndrome in pediatric patients"]
        },
        interactions: ["Anticoagulants and other antiplatelet drugs", "Other NSAIDs (ibuprofen may interfere with aspirin cardioprotection)", "Alcohol"],
        warnings: [
            "Do not administer to children or adolescents recovering from viral infections due to risk of Reye's syndrome.",
            "Verify with your pharmacist or doctor regarding optimal dosing for heart protection versus pain relief."
        ],
        pregnancy: "Consult physician. High doses contraindicated in third trimester.",
        mechanism: "Irreversibly acetylates and inhibits cyclooxygenase-1 (COX-1), blocking thromboxane A2 synthesis in platelets to prevent platelet aggregation for the lifespan of the platelet.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    omeprazole: {
        name: "Omeprazole",
        genericName: "Omeprazole",
        brandNames: ["Prilosec", "Losec"],
        drugClass: "Proton Pump Inhibitor (PPI)",
        uses: [
            "Treatment of gastroesophageal reflux disease (GERD) and erosive esophagitis",
            "Treatment of active duodenal and benign active gastric ulcers",
            "Eradication of Helicobacter pylori in combination with antibiotics"
        ],
        sideEffects: {
            common: ["Headache", "Abdominal pain", "Nausea", "Diarrhea", "Flatulence"],
            serious: ["Clostridioides difficile-associated diarrhea", "Bone fractures with long-term high-dose therapy", "Hypomagnesemia", "Vitamin B12 deficiency with chronic use"]
        },
        interactions: ["Clopidogrel (Plavix - may reduce antiplatelet activation)", "Methotrexate", "Iron salts", "HIV protease inhibitors"],
        warnings: [
            "Take 30 to 60 minutes before a meal, preferably before breakfast.",
            "Verify with your pharmacist or doctor regarding long-term therapy."
        ],
        pregnancy: "Category C. Consult healthcare provider.",
        mechanism: "Suppresses gastric acid secretion by specific inhibition of the H+/K+ ATPase enzyme system at the secretory surface of the gastric parietal cell.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    albuterol: {
        name: "Albuterol",
        genericName: "Albuterol sulfate / Salbutamol",
        brandNames: ["ProAir", "Ventolin", "Proventil"],
        drugClass: "Short-Acting Beta-2 Adrenergic Agonist (Bronchodilator)",
        uses: [
            "Relief and prevention of bronchospasm in patients with asthma or COPD",
            "Prevention of exercise-induced bronchospasm"
        ],
        sideEffects: {
            common: ["Tremor / shakiness", "Nervousness", "Tachycardia (rapid heartbeat)", "Palpitations", "Headache"],
            serious: ["Paradoxical bronchospasm", "Hypokalemia", "Severe cardiac arrhythmias"]
        },
        interactions: ["Beta-blockers (may block bronchodilator effects)", "MAO inhibitors and tricyclic antidepressants", "Diuretics"],
        warnings: [
            "If standard doses do not provide relief or if symptoms rapidly worsen, seek emergency medical care immediately.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category C. Frequently used during pregnancy when asthma rescue is necessary.",
        mechanism: "Selectively stimulates beta-2 adrenergic receptors in bronchial smooth muscle, activating adenyl cyclase to increase cyclic AMP, resulting in bronchodilation.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    gabapentin: {
        name: "Gabapentin",
        genericName: "Gabapentin",
        brandNames: ["Neurontin", "Gralise", "Horizant"],
        drugClass: "Anticonvulsant / Neuropathic Pain Modulator",
        uses: [
            "Management of postherpetic neuralgia (nerve pain following shingles) in adults",
            "Adjunctive therapy in the treatment of partial onset seizures",
            "Management of neuropathic pain and restless legs syndrome"
        ],
        sideEffects: {
            common: ["Dizziness", "Somnolence / drowsiness", "Ataxia / unsteady gait", "Peripheral edema", "Fatigue"],
            serious: ["Respiratory depression (especially when combined with opioids)", "Suicidal ideation or mood changes", "Severe hypersensitivity / DRESS syndrome"]
        },
        interactions: ["Opioids (compounds life-threatening respiratory depression and sedation)", "Antacids (reduce absorption by ~20%)"],
        warnings: [
            "Do not discontinue abruptly due to risk of increased seizure frequency and withdrawal symptoms.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category C. Consult healthcare provider.",
        mechanism: "Binds to the alpha-2-delta auxiliary subunit of voltage-gated calcium channels in the CNS, reducing the release of excitatory neurotransmitters.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    sertraline: {
        name: "Sertraline",
        genericName: "Sertraline hydrochloride",
        brandNames: ["Zoloft"],
        drugClass: "Selective Serotonin Reuptake Inhibitor (SSRI)",
        uses: [
            "Treatment of major depressive disorder (MDD)",
            "Treatment of obsessive-compulsive disorder (OCD), panic disorder, and social anxiety disorder",
            "Treatment of post-traumatic stress disorder (PTSD) and premenstrual dysphoric disorder"
        ],
        sideEffects: {
            common: ["Nausea", "Insomnia or somnolence", "Diarrhea", "Dry mouth", "Sexual dysfunction", "Tremor"],
            serious: ["BOXED WARNING: Increased risk of suicidal thoughts and behaviors in young adults/children", "Serotonin syndrome", "Abnormal bleeding", "Hyponatremia / SIADH"]
        },
        interactions: ["MAO inhibitors (contraindicated due to serotonin syndrome risk)", "Other serotonergic agents (triptans, tramadol, St. John's wort)", "NSAIDs and blood thinners"],
        warnings: [
            "BOXED WARNING: Monitor for worsening depression or emergence of suicidal thoughts, especially during initiation or dosage adjustments.",
            "Do not stop taking suddenly; gradual tapering under medical guidance is recommended to avoid discontinuation syndrome."
        ],
        pregnancy: "Category C. Discuss benefits and potential risks with your physician.",
        mechanism: "Selectively inhibits the presynaptic reuptake of serotonin (5-HT) in the central nervous system, enhancing serotonergic neurotransmission.",
        verifiedNote: "Verify with your pharmacist or doctor"
    },
    fexofenadine: {
        name: "Fexofenadine",
        genericName: "Fexofenadine hydrochloride",
        brandNames: ["Allegra"],
        drugClass: "Second-generation Non-sedating Antihistamine",
        uses: [
            "Relief of symptoms associated with seasonal allergic rhinitis in adults and children",
            "Treatment of uncomplicated skin manifestations of chronic idiopathic urticaria"
        ],
        sideEffects: {
            common: ["Headache", "Back pain", "Drowsiness (minimal compared to first-generation)", "Dizziness"],
            serious: ["Severe hypersensitivity reactions", "Facial swelling or difficulty breathing"]
        },
        interactions: ["Fruit juices (apple, orange, grapefruit) significantly decrease absorption; take with water only", "Aluminum and magnesium antacids"],
        warnings: [
            "Take with water only; fruit juices interfere with drug absorption.",
            "Verify with your pharmacist or doctor"
        ],
        pregnancy: "Category C. Consult healthcare provider.",
        mechanism: "Selective peripheral H1-receptor antagonist that does not cross the blood-brain barrier in therapeutic concentrations.",
        verifiedNote: "Verify with your pharmacist or doctor"
    }
}

/**
 * Normalizes input medication name to search our verified clinical database.
 * Returns verified DrugInfo if matched, or null if no verified information is available.
 */
export function lookupDrugInfo(rawQuery: string): DrugInfo | null {
    if (!rawQuery || typeof rawQuery !== "string") return null

    // Strip dosage, forms, punctuation, brackets, parentheses
    const cleaned = rawQuery
        .toLowerCase()
        .replace(/\b\d+(\.\d+)?\s*(mg|mcg|g|ml|tablet|capsule|pill|er|xr|cr|sr|hcl)\b/gi, "")
        .replace(/[()[\]{}"',.;:]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

    if (!cleaned) return null

    // Direct key match
    if (DRUG_DATABASE[cleaned]) {
        return DRUG_DATABASE[cleaned]
    }

    // Search keys and brand names
    const entries = Object.entries(DRUG_DATABASE)
    for (const [key, drug] of entries) {
        if (key === cleaned || cleaned.includes(key) || key.includes(cleaned)) {
            return drug
        }
        if (drug.name.toLowerCase().includes(cleaned) || cleaned.includes(drug.name.toLowerCase())) {
            return drug
        }
        if (drug.genericName.toLowerCase().includes(cleaned) || cleaned.includes(drug.genericName.toLowerCase())) {
            return drug
        }
        if (drug.brandNames.some(b => b.toLowerCase().includes(cleaned) || cleaned.includes(b.toLowerCase()))) {
            return drug
        }
    }

    return null
}
