/**
 * Curated multiple-choice quiz banks for the interactive quiz card.
 *
 * Quizzes are deterministic so they work in demo mode (no GEMINI_API_KEY) and
 * so the same request always produces a balanced, correct set of questions.
 * Each bank is tagged with the subjects and keywords it belongs to; the closest
 * bank wins, with a per-subject default when the student just says "quiz me".
 */

export interface QuizQuestion {
  prompt: string;
  options: string[];
  /** Zero-based index of the correct option. */
  answer: number;
  hint?: string;
  explanation?: string;
}

export interface QuizSpec {
  title: string;
  subject: string;
  topic: string;
  questions: QuizQuestion[];
}

interface QuizBank {
  id: string;
  title: string;
  subject: string;
  topic: string;
  subjects: readonly string[];
  keywords: string[];
  questions: QuizQuestion[];
}

const MATH = [
  "General Mathematics",
  "Statistics and Probability",
  "Pre-Calculus",
  "Basic Calculus",
] as const;

const PHYSICS = ["General Physics 1", "General Physics 2"] as const;
const CHEMISTRY = ["General Chemistry 1", "General Chemistry 2"] as const;
const BIOLOGY = [
  "General Biology 1",
  "General Biology 2",
  "Earth and Life Science",
] as const;

const BANKS: QuizBank[] = [
  {
    id: "domain-range",
    title: "Domain and range",
    subject: "General Mathematics",
    topic: "domain and range",
    subjects: MATH,
    keywords: [
      "domain",
      "range",
      "domain and range",
      "input",
      "output",
      "undefined",
      "square root",
      "rational function",
    ],
    questions: [
      {
        prompt: String.raw`What is the domain of $f(x)=\dfrac{1}{x-3}$?`,
        options: [
          String.raw`$x \ne 3$`,
          String.raw`$x \ge 3$`,
          String.raw`$x > 3$`,
          "All real numbers",
        ],
        answer: 0,
        hint: "A fraction is undefined when its denominator equals zero.",
        explanation: String.raw`Set $x-3 \ne 0$, which gives $x \ne 3$.`,
      },
      {
        prompt: String.raw`What is the range of $f(x)=\dfrac{1}{x-3}$?`,
        options: [
          "All real numbers",
          String.raw`$y \ne 3$`,
          String.raw`$y \ne 0$`,
          String.raw`$y \ge 0$`,
        ],
        answer: 2,
        hint: "A fraction with numerator 1 can get close to 0, but never equal it.",
        explanation: String.raw`The output never reaches 0, so the range is $\{y \in \mathbb{R} \mid y \ne 0\}$.`,
      },
      {
        prompt: String.raw`What is the domain of $f(x)=\sqrt{x+5}$?`,
        options: [
          String.raw`$x \le -5$`,
          "All real numbers",
          String.raw`$x \ge -5$`,
          String.raw`$x > 5$`,
        ],
        answer: 2,
        hint: "The expression under a square root must be non-negative.",
        explanation: String.raw`$x+5 \ge 0 \Rightarrow x \ge -5$.`,
      },
      {
        prompt: String.raw`What is the domain of $f(x)=x^2-4x+7$?`,
        options: [
          String.raw`$x \ge 2$`,
          "All real numbers",
          String.raw`$x \ne 2$`,
          String.raw`$x \ge 0$`,
        ],
        answer: 1,
        hint: "Polynomials do not have denominators or even roots to restrict them.",
        explanation: "A polynomial is defined for every real number.",
      },
      {
        prompt: String.raw`What is the range of $f(x)=x^2$?`,
        options: [
          String.raw`$y \le 0$`,
          String.raw`$y > 0$`,
          "All real numbers",
          String.raw`$y \ge 0$`,
        ],
        answer: 3,
        hint: "A real number squared is never negative.",
        explanation: String.raw`$x^2 \ge 0$ for every real $x$, so the range is $[0,\infty)$.`,
      },
      {
        prompt: String.raw`What is the range of $f(x)=\sqrt{x-2}$?`,
        options: [
          String.raw`$y \ge 2$`,
          String.raw`$y > 2$`,
          "All real numbers",
          String.raw`$y \ge 0$`,
        ],
        answer: 3,
        hint: "A principal square root returns 0 or a positive value.",
        explanation: String.raw`The smallest output is $\sqrt{0}=0$, so the range is $[0,\infty)$.`,
      },
    ],
  },
  {
    id: "quadratic",
    title: "Quadratic functions",
    subject: "General Mathematics",
    topic: "quadratic functions",
    subjects: MATH,
    keywords: [
      "quadratic",
      "parabola",
      "vertex",
      "axis of symmetry",
      "roots",
      "discriminant",
    ],
    questions: [
      {
        prompt: String.raw`What is the $x$-coordinate of the vertex of $y=2x^2-8x+1$?`,
        options: [
          String.raw`$x=2$`,
          String.raw`$x=-2$`,
          String.raw`$x=4$`,
          String.raw`$x=1$`,
        ],
        answer: 0,
        hint: String.raw`Use $x=-\dfrac{b}{2a}$.`,
        explanation: String.raw`$x=-\dfrac{-8}{2(2)}=2$.`,
      },
      {
        prompt: String.raw`What is the axis of symmetry of $y=x^2+6x$?`,
        options: [
          String.raw`$x=3$`,
          String.raw`$x=-3$`,
          String.raw`$x=6$`,
          String.raw`$x=-6$`,
        ],
        answer: 1,
        hint: String.raw`Here $a=1$ and $b=6$.`,
        explanation: String.raw`$x=-\dfrac{6}{2(1)}=-3$.`,
      },
      {
        prompt: String.raw`What are the roots of $x^2-5x+6=0$?`,
        options: [
          String.raw`$x=1$ and $x=6$`,
          String.raw`$x=-2$ and $x=-3$`,
          String.raw`$x=2$ and $x=3$`,
          String.raw`$x=0$ and $x=5$`,
        ],
        answer: 2,
        hint: "Find two numbers that multiply to 6 and add to −5.",
        explanation: String.raw`$(x-2)(x-3)=0$, so $x=2$ or $x=3$.`,
      },
      {
        prompt: "If $a<0$ in $y=ax^2+bx+c$, which way does the parabola open?",
        options: ["Upward", "Downward", "To the left", "To the right"],
        answer: 1,
        hint: "A negative leading coefficient reflects the parabola.",
        explanation: "When $a<0$, the parabola opens downward and the vertex is a maximum.",
      },
      {
        prompt: "If the discriminant $b^2-4ac=0$, how many real roots does the quadratic have?",
        options: [
          "No real roots",
          "Two distinct real roots",
          "Infinitely many roots",
          "Exactly one real root",
        ],
        answer: 3,
        hint: "The discriminant sits under the square root in the quadratic formula.",
        explanation: "A zero discriminant makes the two roots coincide, so there is exactly one real root.",
      },
    ],
  },
  {
    id: "functions",
    title: "Functions and notation",
    subject: "General Mathematics",
    topic: "functions",
    subjects: MATH,
    keywords: [
      "function",
      "function notation",
      "evaluate",
      "composition",
      "inverse function",
      "vertical line test",
      "f(x)",
    ],
    questions: [
      {
        prompt: String.raw`If $f(x)=2x+1$, what is $f(3)$?`,
        options: [String.raw`$5$`, String.raw`$7$`, String.raw`$6$`, String.raw`$9$`],
        answer: 1,
        hint: String.raw`Replace every $x$ with 3.`,
        explanation: String.raw`$f(3)=2(3)+1=7$.`,
      },
      {
        prompt: String.raw`If $f(x)=x^2$, what is $f(-2)$?`,
        options: [
          String.raw`$-4$`,
          String.raw`$2$`,
          String.raw`$4$`,
          String.raw`$-2$`,
        ],
        answer: 2,
        hint: "A negative number squared becomes positive.",
        explanation: String.raw`$(-2)^2=4$.`,
      },
      {
        prompt: "A graph passes the vertical line test. What does that tell you?",
        options: [
          "It represents a function",
          "It is not a function",
          "It has no domain",
          "It is always a straight line",
        ],
        answer: 0,
        hint: "A function gives one output for each input.",
        explanation: "If no vertical line crosses the graph more than once, each input has exactly one output.",
      },
      {
        prompt: String.raw`What does $(f \circ g)(x)$ mean?`,
        options: [
          String.raw`$f(x)\cdot g(x)$`,
          String.raw`$f(g(x))$`,
          String.raw`$g(f(x))$`,
          String.raw`$f(x)+g(x)$`,
        ],
        answer: 1,
        hint: "Work from the inside out.",
        explanation: String.raw`Composition applies $g$ first, then $f$: $(f \circ g)(x)=f(g(x))$.`,
      },
      {
        prompt: String.raw`What is the inverse of $f(x)=x+4$?`,
        options: [
          String.raw`$x-4$`,
          String.raw`$x+4$`,
          String.raw`$4x$`,
          String.raw`$\dfrac{1}{x+4}$`,
        ],
        answer: 0,
        hint: "Swap $x$ and $y$, then solve for $y$.",
        explanation: String.raw`$y=x+4 \Rightarrow x=y+4 \Rightarrow y=x-4$.`,
      },
    ],
  },
  {
    id: "derivatives",
    title: "Derivatives",
    subject: "Basic Calculus",
    topic: "derivatives",
    subjects: MATH,
    keywords: [
      "derivative",
      "differentiate",
      "power rule",
      "chain rule",
      "product rule",
      "quotient rule",
    ],
    questions: [
      {
        prompt: String.raw`What is $\dfrac{d}{dx}\left(x^3\right)$?`,
        options: [
          String.raw`$3x^2$`,
          String.raw`$x^2$`,
          String.raw`$3x$`,
          String.raw`$\dfrac{x^4}{4}$`,
        ],
        answer: 0,
        hint: "Bring the exponent down, then subtract one from it.",
        explanation: String.raw`Power rule: $\dfrac{d}{dx}x^n=nx^{n-1}$, so the answer is $3x^2$.`,
      },
      {
        prompt: String.raw`What is $\dfrac{d}{dx}\left(5x^2-3x+2\right)$?`,
        options: [
          String.raw`$10x-3$`,
          String.raw`$5x-3$`,
          String.raw`$10x+2$`,
          String.raw`$5x^2-3$`,
        ],
        answer: 0,
        hint: "Differentiate each term separately.",
        explanation: String.raw`$10x-3+0=10x-3$.`,
      },
      {
        prompt: String.raw`What is $\dfrac{d}{dx}(\sin x)$?`,
        options: [
          String.raw`$\cos x$`,
          String.raw`$-\cos x$`,
          String.raw`$\sin x$`,
          String.raw`$-\sin x$`,
        ],
        answer: 0,
        hint: "The derivative of sine is positive cosine.",
        explanation: String.raw`$\dfrac{d}{dx}\sin x=\cos x$.`,
      },
      {
        prompt: String.raw`What is $\dfrac{d}{dx}\left(e^x\right)$?`,
        options: [
          String.raw`$e^x$`,
          String.raw`$xe^{x-1}$`,
          String.raw`$\ln x$`,
          String.raw`$1$`,
        ],
        answer: 0,
        hint: "The exponential function is its own derivative.",
        explanation: String.raw`$\dfrac{d}{dx}e^x=e^x$.`,
      },
      {
        prompt: String.raw`What is $\dfrac{d}{dx}(2x+1)^3$?`,
        options: [
          String.raw`$3(2x+1)^2$`,
          String.raw`$6(2x+1)^2$`,
          String.raw`$2(2x+1)^2$`,
          String.raw`$6(2x+1)^3$`,
        ],
        answer: 1,
        hint: "Use the chain rule: derivative of the outside times derivative of the inside.",
        explanation: String.raw`$3(2x+1)^2\cdot 2=6(2x+1)^2$.`,
      },
    ],
  },
  {
    id: "limits",
    title: "Limits",
    subject: "Basic Calculus",
    topic: "limits",
    subjects: MATH,
    keywords: ["limit", "limits", "approaches", "continuity", "infinity"],
    questions: [
      {
        prompt: String.raw`Evaluate $\lim_{x \to 2}(3x+1)$.`,
        options: [String.raw`$5$`, String.raw`$7$`, String.raw`$6$`, String.raw`$3$`],
        answer: 1,
        hint: "This polynomial is continuous, so substitute directly.",
        explanation: String.raw`$3(2)+1=7$.`,
      },
      {
        prompt: String.raw`Evaluate $\lim_{x \to 0}\dfrac{\sin x}{x}$.`,
        options: [
          String.raw`$0$`,
          String.raw`$1$`,
          String.raw`$\infty$`,
          "Undefined",
        ],
        answer: 1,
        hint: "This is a standard trigonometric limit.",
        explanation: String.raw`$\lim_{x \to 0}\dfrac{\sin x}{x}=1$.`,
      },
      {
        prompt: String.raw`Evaluate $\lim_{x \to 3}\dfrac{x^2-9}{x-3}$.`,
        options: [String.raw`$0$`, String.raw`$3$`, String.raw`$6$`, String.raw`$9$`],
        answer: 2,
        hint: "Factor the numerator as a difference of squares.",
        explanation: String.raw`$\dfrac{(x-3)(x+3)}{x-3}=x+3$, which approaches 6.`,
      },
      {
        prompt: String.raw`Evaluate $\lim_{x \to \infty}\dfrac{1}{x}$.`,
        options: [
          String.raw`$1$`,
          String.raw`$\infty$`,
          String.raw`$0$`,
          String.raw`$-1$`,
        ],
        answer: 2,
        hint: "As the denominator grows without bound, the fraction shrinks.",
        explanation: "The value approaches 0 from the positive side.",
      },
      {
        prompt: String.raw`Evaluate $\lim_{x \to 1}\dfrac{x^2-1}{x-1}$.`,
        options: [
          String.raw`$1$`,
          String.raw`$2$`,
          String.raw`$0$`,
          "Undefined",
        ],
        answer: 1,
        hint: "Factor $x^2-1$ as $(x-1)(x+1)$.",
        explanation: String.raw`After cancelling, $x+1$ approaches 2.`,
      },
    ],
  },
  {
    id: "trig-unit-circle",
    title: "The unit circle and trig values",
    subject: "Pre-Calculus",
    topic: "the unit circle",
    subjects: MATH,
    keywords: [
      "unit circle",
      "sine",
      "cosine",
      "tangent",
      "radian",
      "trigonometric",
      "sin",
      "cos",
      "tan",
    ],
    questions: [
      {
        prompt: String.raw`What is $\sin\left(\dfrac{\pi}{6}\right)$?`,
        options: [
          String.raw`$\dfrac{1}{2}$`,
          String.raw`$\dfrac{\sqrt{2}}{2}$`,
          String.raw`$\dfrac{\sqrt{3}}{2}$`,
          String.raw`$1$`,
        ],
        answer: 0,
        hint: String.raw`$\dfrac{\pi}{6}$ is 30°.`,
        explanation: String.raw`At 30°, the vertical projection (sine) is $\dfrac{1}{2}$.`,
      },
      {
        prompt: String.raw`What is $\cos\left(\dfrac{\pi}{3}\right)$?`,
        options: [
          String.raw`$0$`,
          String.raw`$\dfrac{1}{2}$`,
          String.raw`$\dfrac{\sqrt{3}}{2}$`,
          String.raw`$1$`,
        ],
        answer: 1,
        hint: String.raw`$\dfrac{\pi}{3}$ is 60°.`,
        explanation: String.raw`At 60°, the horizontal projection (cosine) is $\dfrac{1}{2}$.`,
      },
      {
        prompt: String.raw`What are the coordinates of the point at $\theta=\dfrac{\pi}{2}$ on the unit circle?`,
        options: [
          String.raw`$(1,0)$`,
          String.raw`$(0,1)$`,
          String.raw`$(-1,0)$`,
          String.raw`$(0,-1)$`,
        ],
        answer: 1,
        hint: String.raw`$\dfrac{\pi}{2}$ is a quarter-turn counterclockwise from $(1,0)$.`,
        explanation: String.raw`$(\cos\frac{\pi}{2},\sin\frac{\pi}{2})=(0,1)$.`,
      },
      {
        prompt: String.raw`What is $\tan\left(\dfrac{\pi}{4}\right)$?`,
        options: [
          String.raw`$0$`,
          String.raw`$1$`,
          String.raw`$\dfrac{\sqrt{2}}{2}$`,
          "Undefined",
        ],
        answer: 1,
        hint: String.raw`$\tan\theta=\dfrac{\sin\theta}{\cos\theta}$.`,
        explanation: String.raw`At 45°, sine and cosine are equal, so their ratio is 1.`,
      },
      {
        prompt: "Which identity is always true for any angle θ?",
        options: [
          String.raw`$\sin^2\theta+\cos^2\theta=1$`,
          String.raw`$\sin\theta+\cos\theta=1$`,
          String.raw`$\tan\theta=1$`,
          String.raw`$\sin^2\theta-\cos^2\theta=1$`,
        ],
        answer: 0,
        hint: "It comes from the Pythagorean theorem on the unit circle.",
        explanation: String.raw`The point $(\cos\theta,\sin\theta)$ lies on $x^2+y^2=1$.`,
      },
    ],
  },
  {
    id: "probability",
    title: "Probability basics",
    subject: "Statistics and Probability",
    topic: "probability",
    subjects: MATH,
    keywords: [
      "probability",
      "random variable",
      "mean",
      "variance",
      "normal",
      "complement",
      "expected value",
    ],
    questions: [
      {
        prompt: "What is the complement rule for an event A?",
        options: [
          String.raw`$P(\text{not }A)=1-P(A)$`,
          String.raw`$P(\text{not }A)=P(A)-1$`,
          String.raw`$P(\text{not }A)=1+P(A)$`,
          String.raw`$P(\text{not }A)=P(A)$`,
        ],
        answer: 0,
        hint: "The probabilities of an event and its complement add to 1.",
        explanation: String.raw`$P(A)+P(\text{not }A)=1$.`,
      },
      {
        prompt: "A fair six-sided die is rolled once. What is the probability of an even number?",
        options: [
          String.raw`$\dfrac{1}{6}$`,
          String.raw`$\dfrac{1}{3}$`,
          String.raw`$\dfrac{1}{2}$`,
          String.raw`$\dfrac{2}{3}$`,
        ],
        answer: 2,
        hint: "The even outcomes are 2, 4, and 6.",
        explanation: String.raw`Three favourable outcomes out of six: $\dfrac{3}{6}=\dfrac{1}{2}$.`,
      },
      {
        prompt: "Two fair coins are flipped. What is the probability of getting two heads?",
        options: [
          String.raw`$\dfrac{1}{2}$`,
          String.raw`$\dfrac{1}{3}$`,
          String.raw`$\dfrac{1}{4}$`,
          String.raw`$\dfrac{3}{4}$`,
        ],
        answer: 2,
        hint: "The sample space is HH, HT, TH, TT.",
        explanation: String.raw`Only HH works, so the probability is $\dfrac{1}{4}$.`,
      },
      {
        prompt: "How do you compute the mean of a discrete random variable?",
        options: [
          String.raw`$\sum x\,P(x)$`,
          String.raw`$\sum P(x)$`,
          String.raw`$\dfrac{\sum x}{n}$`,
          String.raw`$\sum x^2 P(x)$`,
        ],
        answer: 0,
        hint: "Weight each value by how likely it is.",
        explanation: String.raw`The expected value is $\mu=\sum x\,P(x)$.`,
      },
      {
        prompt: "A standard normal distribution has:",
        options: [
          "Mean 0 and standard deviation 1",
          "Mean 1 and standard deviation 0",
          "Mean 0 and standard deviation 0",
          "Mean 1 and standard deviation 1",
        ],
        answer: 0,
        hint: "The standard normal is the z-distribution.",
        explanation: "By definition, the standard normal has μ = 0 and σ = 1.",
      },
    ],
  },
  {
    id: "kinematics",
    title: "Kinematics",
    subject: "General Physics 1",
    topic: "kinematics",
    subjects: PHYSICS,
    keywords: [
      "kinematics",
      "velocity",
      "acceleration",
      "displacement",
      "free fall",
      "motion",
      "speed",
    ],
    questions: [
      {
        prompt: "What is the SI unit of acceleration?",
        options: [
          String.raw`$\text{m/s}$`,
          String.raw`$\text{m/s}^2$`,
          String.raw`$\text{N}$`,
          String.raw`$\text{kg·m/s}$`,
        ],
        answer: 1,
        hint: "Acceleration is the rate of change of velocity.",
        explanation: String.raw`Velocity is m/s, so its rate of change is $\text{m/s}^2$.`,
      },
      {
        prompt: "Near Earth's surface, what is the usual value of free-fall acceleration?",
        options: [
          String.raw`$9.8\ \text{m/s}^2$`,
          String.raw`$9.8\ \text{m/s}$`,
          String.raw`$3.0\ \text{m/s}^2$`,
          String.raw`$0$`,
        ],
        answer: 0,
        hint: "It is often approximated as 9.8 or 10.",
        explanation: String.raw`$g \approx 9.8\ \text{m/s}^2$ downward.`,
      },
      {
        prompt: String.raw`The equation $v=u+at$ gives:`,
        options: [
          "Velocity after time t",
          "Displacement after time t",
          "Acceleration after time t",
          "Force after time t",
        ],
        answer: 0,
        hint: "u is initial velocity and a is acceleration.",
        explanation: "It is the first kinematic equation for constant acceleration.",
      },
      {
        prompt: "On a velocity-time graph, what does the area under the curve represent?",
        options: ["Acceleration", "Displacement", "Force", "Mass"],
        answer: 1,
        hint: "Area = velocity × time.",
        explanation: "Velocity multiplied by time gives displacement.",
      },
      {
        prompt: "An object moves at constant velocity. What is its acceleration?",
        options: [
          "Zero",
          "Increasing",
          "Decreasing",
          "Equal to its speed",
        ],
        answer: 0,
        hint: "Constant velocity means the velocity is not changing.",
        explanation: "Acceleration is the change in velocity over time, so it is zero.",
      },
    ],
  },
  {
    id: "stoichiometry",
    title: "Stoichiometry",
    subject: "General Chemistry 1",
    topic: "stoichiometry",
    subjects: CHEMISTRY,
    keywords: [
      "stoichiometry",
      "mole",
      "molar mass",
      "avogadro",
      "limiting reactant",
      "balance",
      "chemical equation",
    ],
    questions: [
      {
        prompt: "Which formula relates moles, mass, and molar mass?",
        options: [
          String.raw`$n=\dfrac{m}{M}$`,
          String.raw`$n=mM$`,
          String.raw`$n=\dfrac{M}{m}$`,
          String.raw`$n=\dfrac{m}{V}$`,
        ],
        answer: 0,
        hint: "Moles are mass divided by mass per mole.",
        explanation: String.raw`$n$ is moles, $m$ is mass in grams, and $M$ is molar mass in g/mol.`,
      },
      {
        prompt: "What is Avogadro's number?",
        options: [
          String.raw`$6.022\times10^{23}$`,
          String.raw`$3.14\times10^{23}$`,
          String.raw`$9.8\times10^{23}$`,
          String.raw`$1.0\times10^{23}$`,
        ],
        answer: 0,
        hint: "It is the number of particles in one mole.",
        explanation: String.raw`One mole contains $6.022\times10^{23}$ representative particles.`,
      },
      {
        prompt: String.raw`Balance $\text{H}_2+\text{O}_2 \to \text{H}_2\text{O}$. What coefficient goes before $\text{H}_2\text{O}$?`,
        options: [String.raw`$1$`, String.raw`$2$`, String.raw`$3$`, String.raw`$4$`],
        answer: 1,
        hint: "There are two oxygen atoms on the left.",
        explanation: String.raw`$2\text{H}_2+\text{O}_2\to2\text{H}_2\text{O}$.`,
      },
      {
        prompt: String.raw`What is the molar mass of water, $\text{H}_2\text{O}$?`,
        options: [
          String.raw`$16\ \text{g/mol}$`,
          String.raw`$18\ \text{g/mol}$`,
          String.raw`$20\ \text{g/mol}$`,
          String.raw`$2\ \text{g/mol}$`,
        ],
        answer: 1,
        hint: "Hydrogen is about 1 g/mol and oxygen is about 16 g/mol.",
        explanation: String.raw`$2(1)+16=18\ \text{g/mol}$.`,
      },
      {
        prompt: "What does the limiting reactant determine?",
        options: [
          "The maximum amount of product formed",
          "The reactant with the largest mass",
          "The colour of the product",
          "The temperature of the reaction",
        ],
        answer: 0,
        hint: "The reaction stops when one reactant runs out.",
        explanation: "The limiting reactant is used up first and caps the theoretical yield.",
      },
    ],
  },
  {
    id: "cell",
    title: "Cell structures",
    subject: "General Biology 1",
    topic: "cell structures",
    subjects: BIOLOGY,
    keywords: [
      "cell",
      "nucleus",
      "mitochondria",
      "ribosome",
      "organelle",
      "cell membrane",
      "cell wall",
    ],
    questions: [
      {
        prompt: "Which organelle is often called the powerhouse of the cell?",
        options: ["Nucleus", "Mitochondrion", "Ribosome", "Cell membrane"],
        answer: 1,
        hint: "It releases energy from food through cellular respiration.",
        explanation: "Mitochondria produce most of the cell's ATP.",
      },
      {
        prompt: "Which structure controls the cell's activities and stores DNA?",
        options: ["Nucleus", "Cytoplasm", "Cell wall", "Vacuole"],
        answer: 0,
        hint: "It is the large, central organelle in many cells.",
        explanation: "The nucleus contains the genetic instructions that direct the cell.",
      },
      {
        prompt: "Where does protein synthesis happen?",
        options: ["Ribosome", "Lysosome", "Mitochondrion", "Golgi body"],
        answer: 0,
        hint: "These small structures can be free-floating or attached to the ER.",
        explanation: "Ribosomes assemble amino acids into proteins.",
      },
      {
        prompt: "What is the main job of the cell membrane?",
        options: [
          "Produce energy",
          "Control what enters and leaves the cell",
          "Store DNA",
          "Make proteins",
        ],
        answer: 1,
        hint: "It is selectively permeable.",
        explanation: "The membrane regulates the movement of substances into and out of the cell.",
      },
      {
        prompt: "Which structure is found in plant cells but not in animal cells?",
        options: ["Cell membrane", "Cell wall", "Nucleus", "Mitochondrion"],
        answer: 1,
        hint: "It gives plant cells a rigid, box-like shape.",
        explanation: "A cellulose cell wall provides structural support to plant cells.",
      },
    ],
  },
];

const QUIZ_INTENT_RE =
  /\b(quiz|test\s+me|give\s+me\s+(?:a\s+|some\s+)?(?:quiz|practice\s+questions?|questions?)|practice\s+(?:quiz|test|questions?|problems?)|mock\s+(?:test|exam)|reviewer|drill\s+me|ask\s+me\s+(?:some\s+|a\s+few\s+|\d+\s+)?questions?|check\s+my\s+understanding)\b/i;

const DEFAULT_BANK_BY_SUBJECT: Record<string, string> = {
  "General Mathematics": "domain-range",
  "Statistics and Probability": "probability",
  "Pre-Calculus": "trig-unit-circle",
  "Basic Calculus": "derivatives",
  "General Physics 1": "kinematics",
  "General Physics 2": "kinematics",
  "General Chemistry 1": "stoichiometry",
  "General Chemistry 2": "stoichiometry",
  "General Biology 1": "cell",
  "General Biology 2": "cell",
  "Earth and Life Science": "cell",
};

export function wantsQuiz(message: string): boolean {
  return QUIZ_INTENT_RE.test(message);
}

function toSpec(bank: QuizBank): QuizSpec {
  return {
    title: bank.title,
    subject: bank.subject,
    topic: bank.topic,
    questions: bank.questions.map((question) => ({
      ...question,
      options: [...question.options],
    })),
  };
}

/**
 * Pick the quiz bank that best matches the student's request. Subject affinity
 * is a tie-breaker, not a reason on its own: a topic keyword must match, or the
 * request must be a generic "quiz me" (which uses the subject's default bank).
 */
export function buildQuiz(subject: string, message: string): QuizSpec | null {
  if (!wantsQuiz(message)) return null;

  const text = message.toLowerCase();
  let best: { bank: QuizBank; score: number } | null = null;

  for (const bank of BANKS) {
    let score = 0;
    if (bank.subjects.includes(subject)) score += 2;

    for (const keyword of bank.keywords) {
      if (text.includes(keyword)) score += keyword.split(/\s+/).length + 1;
    }

    if (!best || score > best.score) best = { bank, score };
  }

  if (best && best.score > 2) return toSpec(best.bank);

  const defaultId = DEFAULT_BANK_BY_SUBJECT[subject];
  if (!defaultId) return null;

  const fallback = BANKS.find((bank) => bank.id === defaultId);
  return fallback ? toSpec(fallback) : null;
}
