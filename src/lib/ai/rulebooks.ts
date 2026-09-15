/**
 * LearnGraph Ground-Truth Subject Rulebooks (Tier 2 Verification)
 * Non-negotiable scientific axioms, mathematical invariants, and deterministic validators.
 * Used for prompt injection and programmatic cross-verification to prevent hallucinations
 * and eliminate false positives.
 */

export interface RulebookRule {
  id: string;
  category: string;
  axiom: string;
  common_misconception: string;
  zero_tolerance_check: (text: string) => { isViolation: boolean; reason?: string };
}

export const CHEMISTRY_RULEBOOK: RulebookRule[] = [
  {
    id: 'chem_atomic_radius_period',
    category: 'Periodic Properties: Atomic Radii',
    axiom: 'Across a period from left to right, atomic radius DECREASES because effective nuclear charge (Z_eff) increases, pulling the electron cloud closer to the nucleus while the principal quantum number (n) remains constant.',
    common_misconception: 'Claiming atomic radius increases across a period because atomic number increases.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('across a period') || lower.includes('across period 3')) && lower.includes('radius increases')) {
        return {
          isViolation: true,
          reason: 'Violates periodic law: atomic radius strictly decreases across a period from left to right due to increasing effective nuclear charge.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'chem_atomic_radius_period3_mg_al',
    category: 'Periodic Properties: Period 3 Ordering',
    axiom: 'In Period 3, Magnesium (atomic radius ~160 pm) is strictly LARGER than Aluminium (~143 pm) due to greater effective nuclear charge in Aluminium.',
    common_misconception: 'Claiming Aluminium is larger than Magnesium.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('al > mg') || lower.includes('al is larger than mg') || lower.includes('aluminium is larger than magnesium')) && !lower.includes('not')) {
        return {
          isViolation: true,
          reason: 'Factual error: Magnesium (160 pm) is larger than Aluminium (143 pm) across Period 3.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'chem_isoelectronic_radii',
    category: 'Periodic Properties: Isoelectronic Species',
    axiom: 'Among isoelectronic ions (e.g. Na+ and F-, both with 10 electrons), the species with higher atomic number (Na+ with Z=11) has a greater nuclear charge, exerting stronger coulombic pull, resulting in a SMALLER ionic radius. Thus, F- (133 pm) > Na+ (102 pm).',
    common_misconception: 'Claiming Na+ is larger than F- because sodium is in Period 3.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('na+ > f-') || lower.includes('na+ is larger than f-') || lower.includes('sodium ion is larger than fluoride')) && !lower.includes('not')) {
        return {
          isViolation: true,
          reason: 'Factual error in isoelectronic radius: F- is larger than Na+ because Na+ has 11 protons pulling 10 electrons versus 9 protons in F-.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'chem_ionisation_enthalpy_nitrogen_oxygen',
    category: 'Ionisation Enthalpy: Subshell Stability',
    axiom: 'The first ionisation enthalpy of Nitrogen (1402 kJ/mol, electronic configuration [He] 2s² 2p³) is strictly HIGHER than that of Oxygen (1314 kJ/mol, [He] 2s² 2p⁴) because Nitrogen possesses a half-filled 2p subshell with extra exchange stability, while Oxygen has two paired electrons in one 2p orbital that experience mutual coulombic repulsion.',
    common_misconception: 'Claiming Oxygen has a higher first ionisation enthalpy than Nitrogen simply because Oxygen has 8 protons versus Nitrogen with 7.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('oxygen > nitrogen') || lower.includes('first ie of oxygen is greater') || lower.includes('ie of oxygen >') || lower.includes('oxygen requires more energy to remove')) && (lower.includes('first') || lower.includes('1st') || lower.includes('ionisation') || lower.includes('ionization'))) {
        return {
          isViolation: true,
          reason: 'Scientific error: First ionisation enthalpy of Nitrogen > Oxygen due to half-filled 2p³ stability and electron-pairing repulsion in Oxygen.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'chem_electron_gain_enthalpy_cl_f',
    category: 'Electron Gain Enthalpy: Chlorine vs Fluorine Anomaly',
    axiom: 'Chlorine (-349 kJ/mol) has a MORE negative electron gain enthalpy than Fluorine (-328 kJ/mol) because Fluorine has an exceptionally compact 2p subshell where an incoming electron experiences strong interelectronic repulsion. In Chlorine, the incoming electron enters the larger, more diffuse 3p subshell.',
    common_misconception: 'Claiming Fluorine has a more negative electron gain enthalpy than Chlorine because Fluorine is the most electronegative element.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('fluorine has a more negative electron gain') || lower.includes('f has more negative electron gain') || lower.includes('f > cl in electron gain') || lower.includes('table values must have a typo')) && !lower.includes('less negative')) {
        return {
          isViolation: true,
          reason: 'Fundamental misconception: Chlorine (-349 kJ/mol) has a more negative electron gain enthalpy than Fluorine (-328 kJ/mol) due to compact 2p interelectronic repulsion in Fluorine.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'chem_electronegativity_pauling',
    category: 'Electronegativity vs Electron Gain Enthalpy',
    axiom: 'Electronegativity is the relative tendency of an atom in a chemical bond to attract shared electron pairs towards itself. It is a dimensionless bonded property (Fluorine is highest at 4.0 on Pauling scale), whereas electron gain enthalpy is an energy term (kJ/mol) for an isolated gaseous atom acquiring an electron.',
    common_misconception: 'Confusing electronegativity (bonded property) with electron gain enthalpy (isolated atom energy).',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('electronegativity is measured in kj/mol') || lower.includes('electronegativity of isolated gaseous atom')) {
        return {
          isViolation: true,
          reason: 'Conceptual confusion: Electronegativity is a bonded, dimensionless property, not an isolated gaseous enthalpy.',
        };
      }
      return { isViolation: false };
    },
  },
];

export const MATHEMATICS_RULEBOOK: RulebookRule[] = [
  {
    id: 'math_exponent_multiplication',
    category: 'Laws of Indices: Multiplication',
    axiom: 'When multiplying terms with identical bases, exponents are ADDED, never multiplied: a^m * a^n = a^(m+n). For power of a power: (a^m)^n = a^(m*n).',
    common_misconception: 'Multiplying exponents when multiplying bases: e.g. x^2 * x^3 = x^6 instead of x^5.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (/x\^2\s*\*\s*x\^3\s*=\s*x\^6/.test(lower) || /a\^m\s*\*\s*a\^n\s*=\s*a\^\(m\*n\)/.test(lower)) {
        return {
          isViolation: true,
          reason: 'Violation of index laws: bases multiply by adding exponents (a^m * a^n = a^(m+n)).',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'math_algebraic_negative_distribution',
    category: 'Algebraic Identities: Negative Sign Distribution',
    axiom: 'Distributing a negative sign across a parenthetical polynomial reverses the sign of EVERY internal term: -(A - B + C) = -A + B - C.',
    common_misconception: 'Failing to distribute negative sign to internal terms: e.g. -(2x - 3) = -2x - 3 instead of -2x + 3.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (/-\s*\(\s*2x\s*-\s*3\s*\)\s*=\s*-2x\s*-\s*3/.test(lower) || /12x\s*-\s*12x\s*=\s*0/.test(lower) && lower.includes('(2x + 3)^2 - (2x - 3)^2')) {
        return {
          isViolation: true,
          reason: 'Sign distribution error: -(A - B) must equal -A + B.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'math_quadratic_zero_product_roots',
    category: 'Quadratic Equations: Zero Product Property & Root Signs',
    axiom: 'If a quadratic equation factors as (x - p)(x + q) = 0, the roots are found by setting each linear factor to zero: x - p = 0 => x = +p, and x + q = 0 => x = -q. The root signs are opposite to the constants in the factors.',
    common_misconception: 'Inverting root signs or copying factor constants directly: e.g. (x - 6)(x + 2) = 0 => roots x = -6, x = +2 instead of x = +6, x = -2.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('(x - 6)(x + 2)') || lower.includes('(x-6)(x+2)')) && (lower.includes('roots are: x = -6') || lower.includes('x = -6 or x = 2') || lower.includes('x = -6, 2'))) {
        return {
          isViolation: true,
          reason: 'Root extraction sign inversion: (x - 6)(x + 2) = 0 yields roots x = +6 and x = -2, not x = -6 and x = +2.',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'math_area_vs_perimeter',
    category: 'Mensuration: Area versus Perimeter',
    axiom: 'For a 2D rectangle, Area = Length * Breadth (expressed in square units: m², cm²). Perimeter = 2 * (Length + Breadth) (expressed in linear units: m, cm). Adding Length + Breadth does NOT yield Area.',
    common_misconception: 'Confusing Area with Perimeter, or writing Area = Length + Breadth.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('area = length + breadth') || lower.includes('area = l + b') || lower.includes('perimeter = length * breadth')) {
        return {
          isViolation: true,
          reason: 'Fundamental geometric flaw: Area = Length * Breadth, whereas Perimeter = 2(Length + Breadth).',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'math_fraction_addition_denominator',
    category: 'Arithmetic: Fraction Addition',
    axiom: 'Fractions cannot be added by simply summing numerators and summing denominators: a/b + c/d = (ad + bc) / (bd). A common denominator is mathematically mandatory.',
    common_misconception: 'Adding straight across: a/b + c/d = (a + c) / (b + d).',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (/1\/2\s*\+\s*1\/3\s*=\s*2\/5/.test(lower) || /\(a\s*\+\s*c\)\s*\/\s*\(b\s*\+\s*d\)/.test(lower)) {
        return {
          isViolation: true,
          reason: 'Arithmetic violation: fractions require a common denominator for addition; cannot sum numerators and denominators directly.',
        };
      }
      return { isViolation: false };
    },
  },
];

export const PHYSICS_RULEBOOK: RulebookRule[] = [
  {
    id: 'phys_friction_net_force',
    category: 'Newtonian Mechanics: Friction & Net Force',
    axiom: 'Kinetic friction strictly opposes the direction of relative motion. On a pulled block: F_net = F_applied - f_k = m * a. Kinetic friction must be SUBTRACTED from the pulling force, never added.',
    common_misconception: 'Adding friction force to driving force: F_net = F_applied + f_k.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('f_net = f + f_k') || lower.includes('30 + 14.7 = 44.7') || lower.includes('f_net = 30 + 14.7')) && lower.includes('friction')) {
        return {
          isViolation: true,
          reason: 'Physical law violation: Friction opposes motion and must be subtracted from applied force (F_net = F - f_k).',
        };
      }
      return { isViolation: false };
    },
  },
  {
    id: 'phys_energy_conservation_height',
    category: 'Work-Energy: Conservation of Mechanical Energy',
    axiom: 'When a mass descends from height H to height h in a conservative gravitational field, the kinetic energy gained equals potential energy lost: 0.5 * m * v² = mg(H - h). Velocity depends on the vertical distance descended (H - h), NOT the remaining elevation h.',
    common_misconception: 'Equating kinetic energy to remaining elevation mg*h instead of mg*(H - h).',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if ((lower.includes('0.5 * m * v^2 = mg * 5') || lower.includes('0.5*m*v^2 = mg*5')) && lower.includes('20 m') && lower.includes('5 m')) {
        return {
          isViolation: true,
          reason: 'Energy conservation violation: Kinetic energy gained equals potential energy lost (H - h = 15m), not remaining height (5m).',
        };
      }
      return { isViolation: false };
    },
  },
];

export const BIOLOGY_CS_RULEBOOK: RulebookRule[] = [
  {
    id: 'bio_dna_replication_direction',
    category: 'Molecular Biology: DNA Polymerase Directionality',
    axiom: 'DNA polymerase synthesizes new DNA strands exclusively in the 5\' to 3\' direction by adding nucleotides to the 3\'-OH group. DNA Ligase catalyses phosphodiester bonds to join Okazaki fragments on the lagging strand.',
    common_misconception: 'Claiming DNA synthesis proceeds 3\' to 5\', or that RNA polymerase seals Okazaki fragments.',
    zero_tolerance_check: (text: string) => {
      const lower = text.toLowerCase();
      if (lower.includes('synthesizes 3\' to 5\'') || lower.includes('synthesizes 3 to 5') || (lower.includes('fragments sealed by rna polymerase') && !lower.includes('not'))) {
        return {
          isViolation: true,
          reason: 'Biological fact error: DNA polymerase synthesizes exclusively 5\' to 3\', and lagging strand fragments are sealed by DNA Ligase.',
        };
      }
      return { isViolation: false };
    },
  },
];

/**
 * Returns formatted text of ground-truth rulebooks for prompt injection
 */
export function getFormattedRulebooksForSubject(subject?: string | null): string {
  const subj = (subject || '').toLowerCase();
  const sections: string[] = [];

  sections.push('=== TIER 2: GROUND-TRUTH DOMAIN RULEBOOKS (MANDATORY EVALUATION AXIOMS) ===');

  if (subj.includes('chem') || subj.includes('science')) {
    sections.push('--- CHEMISTRY GROUND TRUTH ---');
    CHEMISTRY_RULEBOOK.forEach((r, idx) => {
      sections.push(`[RULE C${idx + 1}] ${r.category}:`);
      sections.push(`  AXIOM: ${r.axiom}`);
      sections.push(`  PITFALL TO PENALIZE: ${r.common_misconception}`);
    });
  }

  if (subj.includes('math') || subj.includes('algebra') || subj.includes('geometry') || subj.includes('calc')) {
    sections.push('--- MATHEMATICS GROUND TRUTH ---');
    MATHEMATICS_RULEBOOK.forEach((r, idx) => {
      sections.push(`[RULE M${idx + 1}] ${r.category}:`);
      sections.push(`  AXIOM: ${r.axiom}`);
      sections.push(`  PITFALL TO PENALIZE: ${r.common_misconception}`);
    });
  }

  if (subj.includes('phys')) {
    sections.push('--- PHYSICS GROUND TRUTH ---');
    PHYSICS_RULEBOOK.forEach((r, idx) => {
      sections.push(`[RULE P${idx + 1}] ${r.category}:`);
      sections.push(`  AXIOM: ${r.axiom}`);
      sections.push(`  PITFALL TO PENALIZE: ${r.common_misconception}`);
    });
  }

  if (subj.includes('bio') || subj.includes('cs') || subj.includes('comp')) {
    sections.push('--- BIOLOGY & COMPUTING GROUND TRUTH ---');
    BIOLOGY_CS_RULEBOOK.forEach((r, idx) => {
      sections.push(`[RULE B${idx + 1}] ${r.category}:`);
      sections.push(`  AXIOM: ${r.axiom}`);
      sections.push(`  PITFALL TO PENALIZE: ${r.common_misconception}`);
    });
  }

  // If general or multi-discipline, include both Math and Chemistry
  if (!subj.includes('chem') && !subj.includes('math') && !subj.includes('phys') && !subj.includes('bio')) {
    sections.push('--- CORE STEM CROSS-DISCIPLINARY RULES ---');
    CHEMISTRY_RULEBOOK.slice(0, 3).forEach((r) => sections.push(`* ${r.axiom}`));
    MATHEMATICS_RULEBOOK.slice(0, 3).forEach((r) => sections.push(`* ${r.axiom}`));
  }

  sections.push('=== ZERO-TOLERANCE ENFORCEMENT DIRECTIVE ===');
  sections.push('If a student statement directly contradicts any ground-truth axiom above:');
  sections.push('1. The score for that specific calculation step or conceptual rationale MUST BE 0.');
  sections.push('2. Set evaluation_status to "incorrect" (or "partially_correct" only if a preceding independent step was completely sound).');
  sections.push('3. Flag mistake_detected with the exact violated axiom and misconception.');
  sections.push('=== END TIER 2 RULEBOOKS ===');

  return sections.join('\n');
}

/**
 * Deterministic programmatic validator to verify student answer text against known rulebooks
 */
export function auditTextAgainstRulebooks(
  text: string,
  subject?: string | null
): { hasViolation: boolean; violations: { ruleId: string; category: string; reason: string }[] } {
  const violations: { ruleId: string; category: string; reason: string }[] = [];
  const subj = (subject || '').toLowerCase();

  const rulesToTest: RulebookRule[] = [];
  if (subj.includes('chem') || subj.includes('science')) rulesToTest.push(...CHEMISTRY_RULEBOOK);
  if (subj.includes('math')) rulesToTest.push(...MATHEMATICS_RULEBOOK);
  if (subj.includes('phys')) rulesToTest.push(...PHYSICS_RULEBOOK);
  if (subj.includes('bio') || subj.includes('comp')) rulesToTest.push(...BIOLOGY_CS_RULEBOOK);

  if (rulesToTest.length === 0) {
    rulesToTest.push(...CHEMISTRY_RULEBOOK, ...MATHEMATICS_RULEBOOK, ...PHYSICS_RULEBOOK);
  }

  for (const rule of rulesToTest) {
    const result = rule.zero_tolerance_check(text);
    if (result.isViolation) {
      violations.push({
        ruleId: rule.id,
        category: rule.category,
        reason: result.reason || 'Violated domain rulebook constraint.',
      });
    }
  }

  return {
    hasViolation: violations.length > 0,
    violations,
  };
}
