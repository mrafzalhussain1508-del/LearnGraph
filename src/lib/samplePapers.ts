export function getSubjectSamplePaper(subjectName: string, studentName?: string): string {
  const lower = (subjectName || '').toLowerCase();
  const student = studentName?.trim() || (lower.includes('chem') ? 'Arola Thoudam' : 'Rishu');

  if (lower.includes('btech') || lower.includes('b.tech') || lower.includes('engineering') || lower.includes('matrices') || lower.includes('linear algebra')) {
    return `Student Name: ${student}
Class: B.Tech First Year • Section C
Roll No: BT24EC042
Subject: Engineering Mathematics I
Exam: BT-MATH-101 End-Semester Diagnostic Assessment

Question 1: Matrices & Cayley-Hamilton Theorem (25 Marks)
Prompt: State the Cayley-Hamilton Theorem. Verify it for matrix A = [[2, 1], [1, 2]] and find A^-1.
Student Working:
Characteristic equation: det(A - λI) = 0.
det([[2-λ, 1], [1, 2-λ]]) = (2-λ)^2 - 1 = λ^2 - 4λ + 3 = 0.
By Cayley-Hamilton Theorem, every square matrix satisfies its own characteristic equation: A^2 - 4A + 3I = 0.
A^2 = [[2, 1], [1, 2]] * [[2, 1], [1, 2]] = [[5, 4], [4, 5]].
A^2 - 4A + 3I = [[5, 4], [4, 5]] - [[8, 4], [4, 8]] + [[3, 0], [0, 3]] = [[0, 0], [0, 0]] = 0.
Verified!
Multiplying by A^-1: A - 4I + 3A^-1 = 0 => 3A^-1 = 4I - A => A^-1 = (1/3)(4I - A).
4I - A = [[4, 0], [0, 4]] - [[2, 1], [1, 2]] = [[2, -1], [-1, 2]].
A^-1 = (1/3)[[2, -1], [-1, 2]].
Teacher Grading: 25/25 ✓ Full Marks. Rigorous characteristic polynomial derivation and inverse computation.

Question 2: Eigenvalues & Orthogonal Diagonalization (25 Marks)
Prompt: Find eigenvalues and eigenvectors for matrix B = [[1, 2], [2, 1]]. Is B diagonalizable?
Student Working:
det(B - λI) = (1-λ)^2 - 4 = λ^2 - 2λ - 3 = 0 => (λ - 3)(λ + 1) = 0.
Eigenvalues: λ1 = 3, λ2 = -1.
For λ = 3: (B - 3I)x = [[-2, 2], [2, -2]][x1, x2]^T = 0 => -2x1 + 2x2 = 0 => x1 = x2 => v1 = [1, 1]^T.
For λ = -1: (B + I)x = [[2, 2], [2, 2]][x1, x2]^T = 0 => 2x1 + 2x2 = 0 => x1 = -x2 => v2 = [1, -1]^T.
Since B is real symmetric, eigenvectors are orthogonal (v1 · v2 = 1 - 1 = 0). B is diagonalizable with P = [[1, 1], [1, -1]].
Teacher Grading: 25/25 ✓ Full Marks. Proper spectral theorem execution.

Question 3: Partial Differentiation & Euler's Theorem for Homogeneous Functions (25 Marks)
Prompt: If u = x^3 + y^3 + 3x^2y, verify Euler's theorem: x(∂u/∂x) + y(∂u/∂y) = 3u.
Student Working:
∂u/∂x = 3x^2 + 6xy.
∂u/∂y = 3y^2 + 3x^2.
x(∂u/∂x) + y(∂u/∂y) = x(3x^2 + 6xy) + y(3y^2 + 3x^2) = 3x^3 + 6x^2y + 3y^3 + 3x^2y = 3x^3 + 9x^2y + 3y^3 = 3(x^3 + 3x^2y + y^3) = 3u.
Euler's theorem verified since u(tx, ty) = t^3 u(x, y) is homogeneous of degree n = 3.
Teacher Grading: 25/25 ✓ Full Marks.

Question 4: Ordinary Differential Equations: Second-Order Linear with Constant Coefficients (25 Marks)
Prompt: Solve (D^2 - 4D + 4)y = e^(2x).
Student Working:
Auxiliary equation: m^2 - 4m + 4 = 0 => (m - 2)^2 = 0 => m = 2, 2 (repeated roots).
Complementary function: y_c = (c1 + c2*x)e^(2x).
Particular integral: y_p = (1 / (D - 2)^2) e^(2x).
Since 2 is a double root of auxiliary equation: y_p = (x^2 / 2!) e^(2x) = (x^2 / 2) e^(2x).
Student instead wrote: y_p = x e^(2x) / (2D - 4) = x e^(2x) / 0 = undefined.
Teacher Grading: 12/25 ½ Partial. Differentiated denominator once instead of twice for double resonance root. Correct PI is (x^2/2)e^(2x).`;
  }

  if (lower.includes('phys')) {
    return `Student Name: ${student}
Class: Class 11 • Section B
Roll No: 18
Subject: Physics
Exam: Mechanics, Projectile Motion & Energy Diagnostic

Question 1: Kinematics & Projectile Trajectory (25 Marks)
Prompt: A projectile is launched from ground level at 25 m/s at 30° above horizontal. Find maximum height (g = 9.8 m/s²).
Student Working:
Vertical velocity v_0y = 25 * sin(30°) = 12.5 m/s.
At peak, v_y = 0.
v_y^2 = v_0y^2 - 2gh => 0 = 156.25 - 19.6h => h = 7.97 meters.
Teacher Grading: 25/25 ✓ Full Marks. Clean vector resolution.

Question 2: Newton's Second Law & Friction (25 Marks)
Prompt: A 5 kg block is pulled with force F = 30 N horizontally across rough surface (μ_k = 0.3). Find acceleration.
Student Working:
N = mg = 49 N.
f_k = 0.3 * 49 = 14.7 N.
F_net = F + f_k = 30 + 14.7 = 44.7 N.
a = 44.7 / 5 = 8.94 m/s².
Teacher Grading: 15/25 ½ Partial. Added friction to driving force instead of subtracting opposing resistance.

Question 3: Conservation of Mechanical Energy (25 Marks)
Prompt: Roller coaster of mass 200 kg descends from H = 20 m to h = 5 m. Find velocity at 5 m from rest.
Student Working:
0.5 * m * v^2 = mg * 5 => v = 9.9 m/s.
Teacher Grading: 10/25 ✕ Error. Equated kinetic energy to remaining height (5m) instead of height lost (15m).

Question 4: Rotational Dynamics & Torque (25 Marks)
Prompt: Solid cylinder (I = 0.5 kg·m²) has 12 N·m torque applied for 4 seconds from rest. Calculate final angular velocity.
Student Working:
α = τ / I = 12 / 0.5 = 24 rad/s².
ω = 0 + (24)(4) = 96 rad/s.
Teacher Grading: 25/25 ✓ Full Marks.`;
  }

  if (lower.includes('chem')) {
    const chemStudent = (student && student !== 'Student' && student !== 'Aarav Gupta') ? student : 'Arola Thoudam';
    return `Student Name: ${chemStudent}
Class: Class 11 • Section A
Roll No: 14
Subject: Chemistry
Exam: Periodic Properties & Chemical Trends Diagnostic Test

Question 1: Periodic Trends: Atomic & Ionic Radii (25 Marks)
Prompt: Explain why atomic radius decreases across Period 3 from Na to Cl, but increases down Group 1. Compare the ionic radii of Na+ and F- (isoelectronic species).
Student Working:
Across Period 3, atomic number increases from Na (11) to Cl (17) while electrons are added to the same energy level (n = 3). Effective nuclear charge (Z_eff) increases, drawing valence electrons closer to the nucleus, so atomic radius decreases.
Down Group 1, each successive period adds a new electron shell (principal quantum number n increases), increasing electron shielding and atomic size.
For isoelectronic ions Na+ and F- (both have 10 electrons): Na+ has 11 protons (higher nuclear charge Z), exerting stronger coulombic pull on electrons than F- with 9 protons. Therefore, ionic radius of F- is larger than Na+ (F- > Na+).
Teacher Grading: 25/25 ✓ Full Marks. Flawless effective nuclear charge and isoelectronic radius comparison.

Question 2: Ionisation Enthalpy: Half-Filled Subshell Stability (25 Marks)
Prompt: Compare the first ionisation enthalpies of Nitrogen (Z = 7) and Oxygen (Z = 8). Why does Nitrogen have a higher first ionisation enthalpy than Oxygen?
Student Working:
Oxygen has 8 protons and Nitrogen has 7 protons. Higher nuclear charge always means higher ionisation enthalpy, so Oxygen requires more energy to remove an electron than Nitrogen. First IE of Oxygen > First IE of Nitrogen.
Teacher Grading: 8/25 ✕ Error. Fails to account for half-filled p-orbital stability. Nitrogen (2p³) is extra stable; Oxygen (2p⁴) has electron pairing repulsion making electron removal easier.

Question 3: Electronegativity Trends & Pauling Scale (25 Marks)
Prompt: Define electronegativity. Contrast it with electron gain enthalpy, and explain why Fluorine has the highest Pauling electronegativity (4.0).
Student Working:
Electronegativity is the tendency of an atom in a chemical bond to attract shared electron pairs towards itself. Unlike electron gain enthalpy which measures energy change of isolated gaseous atoms gaining an electron, electronegativity is a dimensionless bonded property.
Fluorine is the smallest halogen with high effective nuclear charge, pulling bonded electrons most strongly. Pauling value is 4.0.
Teacher Grading: 25/25 ✓ Full Marks. Precise definition and distinction from electron gain enthalpy.

Question 4: Electron Gain Enthalpy: Chlorine vs Fluorine Anomaly (25 Marks)
Prompt: Why does Chlorine have a more negative electron gain enthalpy (-349 kJ/mol) than Fluorine (-328 kJ/mol), despite Fluorine being more electronegative?
Student Working:
Fluorine has the highest electronegativity, so it must attract incoming electrons the most strongly and release the most energy. Therefore, Fluorine must have a more negative electron gain enthalpy than Chlorine (-349 kJ/mol for F vs -328 kJ/mol for Cl). The table values must have a typo.
Teacher Grading: 6/25 ✕ Error. Critical misconception: neglected compact 2p interelectronic repulsion in Fluorine. Chlorine adds electron to larger 3p orbital with less repulsion.`;
  }

  if (lower.includes('bio')) {
    return `Student Name: ${student}
Class: Class 12 • Section B
Roll No: 09
Subject: Biology
Exam: Cellular Respiration & Molecular Genetics Diagnostic

Question 1: Cellular Respiration & Chemiosmosis (25 Marks)
Prompt: Trace electron transfer and proton pumping across inner mitochondrial membrane.
Student Working: NADH/FADH2 transfer e- through ETC to O2. Proton gradient drives ATP Synthase rotational catalysis.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: Dihybrid Inheritance (25 Marks)
Prompt: Cross YyRr x YyRr. Calculate expected fraction of Green, Round offspring.
Student Working: P(Green) = 1/4, P(Round) = 3/4. P = (1/4)*(3/4) = 3/16 (18.75%).
Teacher Grading: 25/25 ✓ Full Marks.

Question 3: DNA Replication Directionality (25 Marks)
Prompt: Distinguish leading and lagging strand synthesis at replication fork.
Student Working: Polymerase synthesizes 3' to 5'. Lagging strand fragments sealed by RNA polymerase.
Teacher Grading: 10/25 ✕ Error. Synthesis is 5' to 3', and fragments are ligated by DNA Ligase.

Question 4: Lac Operon Dual Regulation (25 Marks)
Prompt: State of lac operon under high glucose and high lactose.
Student Working: Repressor removed by allolactose, but low cAMP means inactive CAP -> basal transcription only.
Teacher Grading: 25/25 ✓ Full Marks.`;
  }

  if (lower.includes('comp') || lower.includes('cs')) {
    return `Student Name: ${student}
Class: Grade 11
Roll No: 31
Subject: Computer Science
Exam: Data Structures & Asymptotic Complexity Diagnostic

Question 1: Master Theorem Recurrence (25 Marks)
Prompt: Solve T(n) = 2T(n/2) + O(n).
Student Working: a = 2, b = 2, f(n) = O(n). n^(log2 2) = n. Case 2 applies -> T(n) = Θ(n log n).
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: BST Recursive Insertion (25 Marks)
Prompt: Write the recursive case for BST key insertion.
Student Working: if (key < root.val) insert(root.left, key); else insert(root.right, key); return root;
Teacher Grading: 15/25 ½ Partial. Missing pointer re-assignment: must write root.left = insert(root.left, key).

Question 3: 1D Knapsack Space Optimization (25 Marks)
Prompt: Loop iteration direction for capacity w in 1D array 0/1 Knapsack.
Student Working: Loop capacity w forwards from 0 to W: dp[w] = max(dp[w], dp[w-wt] + val).
Teacher Grading: 10/25 ✕ Error. Forward loop allows multiple item reuse (Unbounded); must loop backwards (W down to wt).

Question 4: Dijkstra Algorithm Negative Weights (25 Marks)
Prompt: Why does Dijkstra fail on negative edge weights?
Student Working: Greedy invariant assumes finalized distances cannot be reduced by future edges. Negative edges violate this.
Teacher Grading: 25/25 ✓ Full Marks.`;
  }

  if (lower.includes('hist')) {
    return `Student Name: ${student}
Class: Class 10
Roll No: 12
Subject: History
Exam: Modern World History & Interwar Treaties

Question 1: Primary vs Secondary Sources (25 Marks)
Prompt: Explain distinction and evaluation of source bias.
Student Working: Primary sources are contemporaneous artifacts/eyewitnesses. Secondary sources interpret them. Corroboration identifies bias.
Teacher Grading: 25/25 ✓ Full Marks.

Question 2: British Enclosure Acts (25 Marks)
Prompt: Role of Enclosure Acts in British industrialization.
Student Working: Privatized common fields, displaced tenant farmers migrated to cities supplying factory wage-labor.
Teacher Grading: 25/25 ✓ Full Marks.

Question 3: Treaty of Versailles Article 231 (25 Marks)
Prompt: Significance of Article 231 and reparations.
Student Working: Assigned exclusive war guilt to Austria-Hungary, causing Berlin hyperinflation.
Teacher Grading: 10/25 ✕ Error. Article 231 forced Germany (not Austria) to accept sole war guilt.

Question 4: Non-Aligned Movement Principles (25 Marks)
Prompt: Strategic aims of NAM at Bandung 1955.
Student Working: Nehru, Nasser, Tito rejected superpower blocs, championing self-determination and mutual non-aggression.
Teacher Grading: 25/25 ✓ Full Marks.`;
  }

  // Default: Comprehensive Mathematics Diagnostic
  return `Student Name: ${student}
Class: Class 10 • Section A
Roll No: 24
Subject: Mathematics
Exam: Mathematics Comprehensive Diagnostic Assessment
Date: 2026-09-14

Question 1: Fractions: Arithmetic & Simplification (25 Marks)
Prompt: Evaluate and simplify the fraction expression: 3/4 + 2/5 - 1/2.
Student Working:
LCM of 4, 5, 2 is 20.
3/4 = 15/20, 2/5 = 8/20, 1/2 = 10/20.
(15 + 8 - 10)/20 = 13/20.
Teacher Grading: 25/25 ✓ Full Marks. Clean common denominator calculation.

Question 2: Linear Equations: Distributive Expansion (25 Marks)
Prompt: Solve the linear equation with parentheses: 2(x - 3) = 14.
Student Working:
2(x - 3) = 14 => 2x - 3 = 14 => 2x = 17 => x = 8.5.
Teacher Grading: 8/25 ✕ Incomplete Bracket Distribution. Multiplied 2 by x but failed to distribute to -3 (wrote 2x - 3 = 14 instead of 2x - 6 = 14). Result should be x = 10.

Question 3: Number Theory: Highest Common Factor (HCF) (25 Marks)
Prompt: Find the Highest Common Factor (HCF) of 36 and 48 using prime factorization.
Student Working:
36 = 2^2 * 3^2, 48 = 2^4 * 3.
Common prime factors with lowest exponents: 2^2 * 3 = 4 * 3 = 12. HCF = 12.
Teacher Grading: 25/25 ✓ Full Marks. Flawless prime factorization.

Question 4: Linear Equations Word Problems: Perimeter Modeling (25 Marks)
Prompt: The perimeter of a rectangular garden is 48 meters. The length is 6 meters greater than the width. Find the length and width.
Student Working:
Let width = w, length = w + 6.
Perimeter = 2(w + w + 6) = 4w + 12 = 48.
4w = 36 => w = 9 meters.
Length = 9 + 6 = 15 meters. Verification: 2(15 + 9) = 48m.
Teacher Grading: 25/25 ✓ Full Marks. Excellent algebraic modeling.

Question 5: Quadratic Equations: Factorization & Roots (25 Marks)
Prompt: Solve the quadratic equation by factoring: x^2 - 4x - 12 = 0.
Student Working:
Factors of -12 that add to -4 are -6 and +2.
Factored form: (x - 6)(x + 2) = 0.
Therefore roots are: x = -6 or x = 2.
Teacher Grading: 15/25 ½ Partial. Factored correctly but sign inversion on roots: x - 6 = 0 gives x = +6, and x + 2 = 0 gives x = -2.

Question 6: Exponents & Powers: Product Law of Indices (25 Marks)
Prompt: Simplify and evaluate using exponential rules: 2^3 × 2^4.
Student Working:
When multiplying powers with same base, multiply the indices: 2^(3 × 4) = 2^12 = 4096.
Teacher Grading: 5/25 ✕ Exponent Multiplication Fallacy. Conflated product of powers (add exponents: 2^(3+4) = 2^7 = 128) with power of a power.

Question 7: Mensuration: Rectangle Area Calculation (25 Marks)
Prompt: A rectangle has a length of 12 cm and a breadth of 7 cm. Calculate the Area of the rectangle.
Student Working:
Area of rectangle = Length + Breadth = 12 + 7 = 19 cm.
Teacher Grading: 5/25 ✕ Critical Formula Error. Area of rectangle is Length × Breadth (12 × 7 = 84 cm²), NOT addition (12 + 7 = 19). Conflated area with linear perimeter calculation.`;
}
