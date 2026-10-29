import {
  MATH_SUBJECTS,
  containsPhrase,
  normalize,
  stemToken,
  tokenize,
} from "./curriculum";

export interface ConceptNote {
  id: string;
  title: string;
  subjects: readonly string[];
  keywords: string[];
  body: string;
  /** One concrete, everyday scenario that uses this concept. */
  realWorld?: string;
  followUp: string;
}

const MATH = MATH_SUBJECTS;
const BIO = ["General Biology 1", "General Biology 2", "Earth and Life Science"];
const RESEARCH = ["Research 1", "Research 2", "Capstone Project"];

const NOTES: ConceptNote[] = [
  {
    id: "domain-range",
    title: "Domain and range",
    subjects: MATH,
    keywords: [
      "domain",
      "range",
      "domain and range",
      "allowed inputs",
      "possible outputs",
      "undefined",
      "restriction",
    ],
    body: String.raw`**Domain** is the set of all valid inputs (usually $x$-values). **Range** is the set of all possible outputs (usually $y$-values).

For $f(x)=\frac{1}{x-2}$:
- The denominator cannot be zero, so $x-2 \ne 0 \Rightarrow x \ne 2$. Domain: $\{x \in \mathbb{R} \mid x \ne 2\}$.
- The output can never be zero, so the range is $\{y \in \mathbb{R} \mid y \ne 0\}$.

For square roots, set the expression inside the root $\ge 0$. For polynomials, the domain is all real numbers. To find the range, ask: what outputs can this function actually produce?`,
    realWorld: "A vending machine only accepts certain coins — that's its domain. The snacks it can give out are its range.",
    followUp: String.raw`Want to try one? Find the domain and range of $g(x)=\sqrt{x-3}$.`,
  },
  {
    id: "function-notation",
    title: "Function notation",
    subjects: MATH,
    keywords: [
      "function notation",
      "function",
      "relation",
      "vertical line test",
      "evaluate",
      "f of x",
      "plug in",
      "input",
    ],
    body: String.raw`$f(x)$ means "the output of function $f$ when the input is $x$." It is not $f$ times $x$.

If $f(x)=2x^2-3$, then
$$f(4)=2(4)^2-3=32-3=29.$$
For a variable input, replace every $x$: $f(a+1)=2(a+1)^2-3$.`,
    realWorld: "Think of a recipe written as f(ingredient): put in flour and you get dough. The notation names the process, not multiplication.",
    followUp: `If $f(x)=3x-5$, what is $f(2)$? And what is $f(a)$?`,
  },
  {
    id: "slope-linear",
    title: "Slope and linear equations",
    subjects: MATH,
    keywords: [
      "slope",
      "linear equation",
      "slope intercept",
      "rise over run",
      "x intercept",
      "y intercept",
      "line",
    ],
    body: String.raw`The slope of a line measures how much $y$ changes for each unit change in $x$:
$$m=\frac{y_2-y_1}{x_2-x_1}=\frac{\text{rise}}{\text{run}}.$$
A line in slope-intercept form is $y=mx+b$, where $m$ is the slope and $b$ is the $y$-intercept. A positive slope rises left to right, a negative slope falls, zero slope is horizontal, and an undefined slope is vertical.`,
    realWorld: "A jeepney fare meter is a line: every extra kilometer adds the same amount to the fare.",
    followUp: `Find the slope of the line through $(1,2)$ and $(4,11)$, then write its equation.`,
  },
  {
    id: "inverse-composition",
    title: "Inverse and composite functions",
    subjects: MATH,
    keywords: [
      "inverse function",
      "composition",
      "composite",
      "f(g(x))",
      "one to one",
      "horizontal line test",
    ],
    body: String.raw`Composition means applying one function inside another: $(f \circ g)(x)=f(g(x))$. Work from the inside out.

An inverse function $f^{-1}$ undoes $f$. To find it: write $y=f(x)$, swap $x$ and $y$, then solve for $y$. A function has an inverse only if it is one-to-one (it passes the horizontal line test). Also, $f(f^{-1}(x))=x$ and $f^{-1}(f(x))=x$.`,
    followUp: `If $f(x)=2x+3$, what is $f^{-1}(x)$? Check it by computing $f(f^{-1}(x))$.`,
  },
  {
    id: "quadratic",
    title: "Quadratic functions",
    subjects: MATH,
    keywords: [
      "quadratic",
      "vertex",
      "parabola",
      "axis of symmetry",
      "roots",
      "maximum",
      "minimum",
    ],
    body: String.raw`A quadratic $f(x)=ax^2+bx+c$ graphs as a parabola. Its vertex is at
$$x=-\frac{b}{2a}, \qquad y=f\left(-\frac{b}{2a}\right).$$
The axis of symmetry is $x=-\frac{b}{2a}$. If $a>0$ the parabola opens upward and the vertex is a minimum; if $a<0$ it opens downward and the vertex is a maximum. The roots are where $f(x)=0$, found by factoring, completing the square, or the quadratic formula.`,
    realWorld: "A basketball's height over time traces a parabola, and the vertex is the highest point of the shot.",
    followUp: `Find the vertex of $f(x)=x^2-6x+5$. Is it a maximum or minimum?`,
  },
  {
    id: "exponents-logarithms",
    title: "Exponents and logarithms",
    subjects: MATH,
    keywords: [
      "logarithm",
      "logarithmic",
      "exponential",
      "log",
      "ln",
      "exponent",
      "base",
    ],
    body: String.raw`Exponential and logarithmic functions are inverses. The key equivalence is
$$\log_b(x)=y \iff b^y=x,$$
with $b>0$, $b\ne 1$, and $x>0$.

Useful rules: $\log_b(mn)=\log_b m+\log_b n$, $\log_b\left(\frac{m}{n}\right)=\log_b m-\log_b n$, and $\log_b(m^p)=p\log_b m$. The natural logarithm $\ln x$ means $\log_e x$.`,
    realWorld: "Earthquake magnitude is logarithmic: each whole number step is about 10 times more ground motion.",
    followUp: String.raw`Rewrite $2^5=32$ as a logarithm, then evaluate $\log_3(81)$.`,
  },
  {
    id: "piecewise",
    title: "Piecewise functions",
    subjects: MATH,
    keywords: ["piecewise", "absolute value", "interval", "different formulas"],
    body: String.raw`A piecewise function uses different formulas on different parts of its domain. To evaluate one, first decide which interval the input falls into, then use only that formula.

For example,
$$f(x)=\begin{cases} x+1 & x<0 \\ x^2 & x\ge 0 \end{cases}$$
so $f(-2)=-1$ (use $x+1$) but $f(3)=9$ (use $x^2$).`,
    followUp: `Using that function, what is $f(0)$? What about $f(-0.5)$?`,
  },
  {
    id: "limits-intro",
    title: "What a limit means",
    subjects: ["Basic Calculus"],
    keywords: [
      "limit",
      "limits",
      "approaches",
      "lim",
      "one sided",
      "left hand",
      "right hand",
    ],
    body: String.raw`A limit describes where a function's output is heading as the input gets closer to a value — not necessarily the value at that point.
$$\lim_{x \to a} f(x)=L$$
means $f(x)$ can be made as close to $L$ as we want by taking $x$ close enough to $a$ (but not equal to $a$). A function can have a limit even if $f(a)$ is undefined.`,
    realWorld: "A jeepney slowing as it nears a stop: the limit is the speed it is heading toward, even before it actually stops.",
    followUp: String.raw`Look at $f(x)=\frac{x^2-4}{x-2}$. What happens to $f(x)$ as $x$ gets close to 2?`,
  },
  {
    id: "limit-evaluation",
    title: "Evaluating limits",
    subjects: ["Basic Calculus"],
    keywords: [
      "direct substitution",
      "factor",
      "cancel",
      "conjugate",
      "indeterminate",
      "0/0",
      "evaluate the limit",
    ],
    body: String.raw`Start with direct substitution. If you get a real number, that is the limit.

If you get $\frac{0}{0}$, that is an indeterminate form — do algebra first:
- Factor and cancel: $\lim_{x\to 2}\frac{x^2-4}{x-2}=\lim_{x\to 2}(x+2)=4$.
- Multiply by the conjugate for square roots.
- Combine fractions or simplify complex fractions.

If you get $\frac{\text{nonzero}}{0}$, the limit typically does not exist; check the one-sided limits.`,
    realWorld: "Cancelling the shared factor is like filling in a pothole before driving over that exact spot on the road.",
    followUp: String.raw`Try $\lim_{x\to 3}\frac{x^2-9}{x-3}$. What do you get after factoring?`,
  },
  {
    id: "limits-infinity",
    title: "Limits at infinity",
    subjects: ["Basic Calculus"],
    keywords: [
      "limits at infinity",
      "infinity",
      "horizontal asymptote",
      "degree",
      "leading coefficient",
      "end behavior",
    ],
    body: String.raw`For limits at infinity, compare the highest powers of $x$ in the numerator and denominator.

For a rational function:
- Numerator degree $<$ denominator degree: the limit is $0$.
- Numerator degree $=$ denominator degree: the limit is the ratio of leading coefficients.
- Numerator degree $>$ denominator degree: the limit is $\pm\infty$ (no horizontal asymptote).

Example: $\lim_{x\to\infty}\frac{3x^2+1}{2x^2-x}=\frac{3}{2}$.`,
    followUp: String.raw`What is $\lim_{x\to\infty}\frac{5x+2}{x^2+1}$? Which degree rule applies?`,
  },
  {
    id: "derivative-definition",
    title: "The derivative as a rate of change",
    subjects: ["Basic Calculus"],
    keywords: [
      "derivative",
      "rate of change",
      "slope of tangent",
      "tangent line",
      "definition of derivative",
      "difference quotient",
    ],
    body: String.raw`A derivative measures the instantaneous rate of change of a function — the slope of the tangent line at a point.
$$f'(x)=\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}$$
For $f(x)=x^2$:
$$f'(x)=\lim_{h\to 0}\frac{(x+h)^2-x^2}{h}=\lim_{h\to 0}(2x+h)=2x.$$
So the slope of $y=x^2$ at $x=3$ is $f'(3)=6$.`,
    realWorld: "A tricycle's speedometer shows the derivative of its distance — the rate of change at that exact instant.",
    followUp: `Use the definition to find the derivative of $f(x)=3x+1$. What slope do you get?`,
  },
  {
    id: "derivative-rules",
    title: "Differentiation rules",
    subjects: ["Basic Calculus"],
    keywords: [
      "power rule",
      "product rule",
      "quotient rule",
      "chain rule",
      "sum rule",
      "constant multiple",
      "differentiate",
      "derivative rules",
    ],
    body: String.raw`The main differentiation rules:
- Power rule: $\frac{d}{dx}x^n=nx^{n-1}$.
- Constant multiple: $\frac{d}{dx}[cf(x)]=cf'(x)$.
- Sum/difference: $\frac{d}{dx}[f(x)\pm g(x)]=f'(x)\pm g'(x)$.
- Product rule: $(fg)'=f'g+fg'$.
- Quotient rule: $\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2}$.
- Chain rule: $\frac{d}{dx}f(g(x))=f'(g(x))g'(x)$.

Example: $\frac{d}{dx}(3x^4-2x+7)=12x^3-2$.`,
    realWorld: "The power rule is a shortcut for a long difference quotient, the way a calculator saves you from long division.",
    followUp: `Differentiate $f(x)=(2x+1)^3$. Which rule do you need first?`,
  },
  {
    id: "trig-derivatives",
    title: "Derivatives of trigonometric functions",
    subjects: ["Basic Calculus"],
    keywords: [
      "trig derivative",
      "sin",
      "cos",
      "tan",
      "sec",
      "csc",
      "cot",
      "sine",
      "cosine",
    ],
    body: String.raw`The basic trigonometric derivatives are
$$\frac{d}{dx}\sin x=\cos x,\qquad \frac{d}{dx}\cos x=-\sin x,\qquad \frac{d}{dx}\tan x=\sec^2 x.$$
With the chain rule, $\frac{d}{dx}\sin(3x)=3\cos(3x)$. Watch the sign on cosine — it becomes negative.`,
    realWorld: "A Ferris wheel's height follows a sine curve, so its vertical speed is the cosine — that is the trig derivative in motion.",
    followUp: String.raw`Differentiate $f(x)=\sin(2x)+x^2$. What is $f'(x)$?`,
  },
  {
    id: "continuity",
    title: "Continuity",
    subjects: ["Basic Calculus"],
    keywords: [
      "continuous",
      "continuity",
      "discontinuous",
      "jump",
      "hole",
      "removable",
    ],
    body: String.raw`A function is continuous at $x=a$ when all three hold:
1. $f(a)$ is defined.
2. $\lim_{x\to a}f(x)$ exists.
3. $\lim_{x\to a}f(x)=f(a)$.

If any one fails, the function is discontinuous there. Graphically, continuity means you can draw through the point without a hole, jump, or vertical asymptote.`,
    followUp: String.raw`Is $f(x)=\frac{1}{x-1}$ continuous at $x=1$? Which condition fails?`,
  },
  {
    id: "optimization-related-rates",
    title: "Optimization and related rates",
    subjects: ["Basic Calculus"],
    keywords: [
      "optimization",
      "maximize",
      "minimize",
      "largest area",
      "smallest",
      "related rates",
      "rate of change with respect to time",
    ],
    body: String.raw`For optimization: write the quantity to maximize or minimize as a function of one variable, find its derivative, set the derivative equal to zero, and test the critical points with the first or second derivative test.

For related rates: draw a diagram, write an equation linking the quantities, differentiate both sides with respect to time $t$, then substitute the known values.`,
    followUp: String.raw`A rectangle has perimeter $20\ \text{cm}$. What dimensions give the largest area? Start by writing area in terms of one variable.`,
  },
  {
    id: "trig-identities",
    title: "Trigonometric identities",
    subjects: ["Pre-Calculus"],
    keywords: [
      "trigonometric identity",
      "trig identity",
      "pythagorean identity",
      "sin 2 cos 2",
      "sin^2 + cos^2",
      "simplify trig",
      "prove identity",
    ],
    body: String.raw`The Pythagorean identity is the anchor:
$$\sin^2\theta+\cos^2\theta=1.$$
From it: $\tan^2\theta+1=\sec^2\theta$ and $1+\cot^2\theta=\csc^2\theta$.

Also useful: $\tan\theta=\frac{\sin\theta}{\cos\theta}$, $\cot\theta=\frac{\cos\theta}{\sin\theta}$, $\sec\theta=\frac{1}{\cos\theta}$, $\csc\theta=\frac{1}{\sin\theta}$. To simplify, rewrite everything in sine and cosine, then combine or factor.`,
    realWorld: String.raw`Identities are exchange rates for expressions: $\sin^2\theta+\cos^2\theta=1$ lets you swap one form for another without changing the value.`,
    followUp: String.raw`Simplify $\frac{1-\sin^2\theta}{\cos\theta}$. What do you get?`,
  },
  {
    id: "unit-circle",
    title: "The unit circle",
    subjects: ["Pre-Calculus"],
    keywords: [
      "unit circle",
      "reference angle",
      "quadrant",
      "radian",
      "sin",
      "cos",
      "tan",
      "sine",
      "cosine",
      "tangent",
    ],
    body: String.raw`On the unit circle, a point at angle $\theta$ has coordinates $(\cos\theta,\sin\theta)$. That is why $\cos^2\theta+\sin^2\theta=1$.

Common values: $\sin 30^\circ=\frac12$, $\cos 30^\circ=\frac{\sqrt3}{2}$, $\sin 45^\circ=\cos 45^\circ=\frac{\sqrt2}{2}$, $\sin 60^\circ=\frac{\sqrt3}{2}$, $\cos 60^\circ=\frac12$. Use reference angles and the quadrant to get the sign.`,
    realWorld: "A Ferris wheel is a unit circle in real life: your height is the sine of the angle and your horizontal position is the cosine.",
    followUp: String.raw`What are $\sin 150^\circ$ and $\cos 150^\circ$? Which quadrant is the angle in?`,
  },
  {
    id: "trig-equations",
    title: "Solving trigonometric equations",
    subjects: ["Pre-Calculus"],
    keywords: [
      "solve trig",
      "trig equation",
      "general solution",
      "solve for theta",
      "trigonometric equation",
    ],
    body: String.raw`To solve a trigonometric equation:
1. Isolate the trig function.
2. Find the reference angle.
3. Use the quadrant or the unit circle to write all solutions in the given interval.
4. Add the period if the problem asks for the general solution.

Example: $\sin\theta=\frac12$ gives $\theta=30^\circ$ or $150^\circ$ in $[0^\circ,360^\circ)$.`,
    followUp: String.raw`Solve $\cos\theta=\frac{\sqrt2}{2}$ for $0^\circ\le\theta<360^\circ$. How many solutions are there?`,
  },
  {
    id: "rational-functions",
    title: "Rational functions and asymptotes",
    subjects: ["Pre-Calculus"],
    keywords: [
      "rational function",
      "asymptote",
      "vertical asymptote",
      "horizontal asymptote",
      "hole",
      "graph rational",
    ],
    body: String.raw`For a rational function $f(x)=\frac{P(x)}{Q(x)}$:
- Domain: exclude values where $Q(x)=0$.
- Vertical asymptotes: where $Q(x)=0$ but the factor does not cancel.
- Holes: where a factor cancels from numerator and denominator.
- Horizontal asymptote: compare the degrees of $P$ and $Q$ (same rules as limits at infinity).
- $x$-intercepts: where $P(x)=0$ and $Q(x)\ne 0$.
- $y$-intercept: evaluate $f(0)$ if defined.`,
    followUp: String.raw`Find the domain, vertical asymptote, and horizontal asymptote of $f(x)=\frac{x+1}{x-2}$.`,
  },
  {
    id: "transformations",
    title: "Transformations of graphs",
    subjects: ["Pre-Calculus"],
    keywords: [
      "transformation",
      "shift",
      "reflect",
      "stretch",
      "compress",
      "parent function",
      "graph transformation",
    ],
    body: String.raw`For $y=a\,f(b(x-h))+k$:
- $h$ shifts left/right (opposite the sign).
- $k$ shifts up/down.
- $|a|>1$ stretches vertically; $0<|a|<1$ compresses vertically; $a<0$ reflects across the $x$-axis.
- $|b|>1$ compresses horizontally; $0<|b|<1$ stretches horizontally; $b<0$ reflects across the $y$-axis.

Apply horizontal transformations before vertical ones when graphing.`,
    followUp: `Describe the transformations from $y=x^2$ to $y=-2(x-3)^2+1$.`,
  },
  {
    id: "sequences-series",
    title: "Sequences and series",
    subjects: ["Pre-Calculus", "General Mathematics"],
    keywords: [
      "arithmetic sequence",
      "geometric sequence",
      "series",
      "nth term",
      "common difference",
      "common ratio",
      "sigma notation",
    ],
    body: String.raw`An arithmetic sequence has a constant difference $d$: $a_n=a_1+(n-1)d$. A geometric sequence has a constant ratio $r$: $a_n=a_1r^{n-1}$.

Sums:
$$S_n=\frac{n}{2}(a_1+a_n)\quad\text{(arithmetic)}$$
$$S_n=a_1\frac{1-r^n}{1-r}\quad(r\ne1)\quad\text{(geometric)}$$
An infinite geometric series converges only when $|r|<1$, with $S=\frac{a_1}{1-r}$.`,
    followUp: String.raw`Find the 10th term of the arithmetic sequence $3,7,11,\dots$.`,
  },
  {
    id: "interest",
    title: "Simple and compound interest",
    subjects: ["General Mathematics"],
    keywords: [
      "simple interest",
      "compound interest",
      "interest",
      "principal",
      "annuity",
      "amortization",
    ],
    body: String.raw`Simple interest: $I=Prt$, where $P$ is principal, $r$ is the annual rate, and $t$ is time in years.

Compound interest:
$$A=P\left(1+\frac{r}{n}\right)^{nt}$$
where $n$ is the number of compounding periods per year. More frequent compounding gives a slightly larger amount.`,
    realWorld: "Compound interest is a snowball rolling downhill: it picks up more snow with every turn.",
    followUp: `Invest ₱10,000 at 6% compounded quarterly for 3 years. What are $P$, $r$, $n$, and $t$?`,
  },
  {
    id: "logic",
    title: "Propositions and logic",
    subjects: ["General Mathematics"],
    keywords: [
      "proposition",
      "truth table",
      "logical connective",
      "conjunction",
      "disjunction",
      "negation",
      "conditional",
      "biconditional",
    ],
    body: String.raw`A proposition is a statement that is either true or false, not both. Logical connectives combine propositions:
- Negation: $\neg p$ ("not $p$").
- Conjunction: $p \land q$ ("$p$ and $q$").
- Disjunction: $p \lor q$ ("$p$ or $q$").
- Conditional: $p \to q$ ("if $p$, then $q$").
- Biconditional: $p \leftrightarrow q$ ("$p$ if and only if $q$").

A truth table lists every combination of truth values.`,
    realWorld: "A proposition is a switch that is either on or off — true or false, never both.",
    followUp: String.raw`Build the truth table for $p \land \neg q$. When is it true?`,
  },
  {
    id: "central-tendency",
    title: "Mean, median, and mode",
    subjects: ["Statistics and Probability"],
    keywords: ["mean", "median", "mode", "average", "central tendency"],
    body: String.raw`The mean is the balance point:
$$\bar{x}=\frac{\sum x_i}{n}.$$
The median is the middle value after sorting (average the two middle values if $n$ is even). The mode is the value that appears most often.

The mean is affected by outliers; the median is more resistant.`,
    realWorld: "For your quarterly grades, the mean is your general average, the median is the middle grade, and the mode is the grade you keep seeing.",
    followUp: `For $2,4,4,6,9$, find the mean, median, and mode. Which one is largest?`,
  },
  {
    id: "dispersion",
    title: "Standard deviation and variance",
    subjects: ["Statistics and Probability"],
    keywords: [
      "standard deviation",
      "variance",
      "spread",
      "dispersion",
      "deviations",
    ],
    body: String.raw`Standard deviation measures how spread out values are around the mean:
$$s=\sqrt{\frac{\sum (x_i-\bar{x})^2}{n-1}}$$
for a sample. A small $s$ means values cluster near the mean; a large $s$ means they are more spread out. Variance is $s^2$.`,
    realWorld: "Two archers can have the same average score but very different spreads — standard deviation measures how tightly their arrows cluster.",
    followUp: String.raw`For $2,4,4,6,9$, first find the mean, then compute the deviations $x_i-\bar{x}$.`,
  },
  {
    id: "probability",
    title: "Basic probability",
    subjects: ["Statistics and Probability"],
    keywords: [
      "probability",
      "sample space",
      "event",
      "independent",
      "mutually exclusive",
      "complement",
    ],
    body: String.raw`For equally likely outcomes,
$$P(E)=\frac{\text{number of favorable outcomes}}{\text{total number of outcomes}}.$$
$0\le P(E)\le1$. The complement rule is $P(\text{not }E)=1-P(E)$. For independent events, $P(A\text{ and }B)=P(A)P(B)$. For mutually exclusive events, $P(A\text{ or }B)=P(A)+P(B)$.`,
    realWorld: "A 70% chance of rain means that, over many similar days, it rains about 7 out of 10.",
    followUp: String.raw`A fair die is rolled once. What is $P(\text{even or greater than }4)$?`,
  },
  {
    id: "normal-distribution",
    title: "Normal distribution and z-scores",
    subjects: ["Statistics and Probability"],
    keywords: [
      "normal distribution",
      "z score",
      "z-score",
      "bell curve",
      "standard normal",
    ],
    body: String.raw`A normal distribution is bell-shaped and symmetric about its mean $\mu$, with standard deviation $\sigma$. The $z$-score tells you how many standard deviations a value is from the mean:
$$z=\frac{x-\mu}{\sigma}.$$
Use the $z$-table to convert a $z$-score into a probability or area.`,
    realWorld: "Class heights usually pile up around the average and thin out at the extremes — that bell shape is the normal distribution.",
    followUp: String.raw`If $\mu=50$ and $\sigma=10$, what is the $z$-score of $x=65$?`,
  },
  {
    id: "counting",
    title: "Permutations and combinations",
    subjects: ["Statistics and Probability"],
    keywords: [
      "permutation",
      "combination",
      "factorial",
      "order matters",
      "counting principle",
    ],
    body: String.raw`Use permutations when order matters and combinations when it does not.

$$P(n,r)=\frac{n!}{(n-r)!}\qquad C(n,r)=\frac{n!}{r!(n-r)!}$$

Example: choosing 3 students from 10 for a committee is $C(10,3)=120$. Assigning them to president, secretary, and treasurer is $P(10,3)=720$.`,
    realWorld: "Choosing 3 toppings for a pizza ignores order, but assigning gold, silver, and bronze does not — that is combinations versus permutations.",
    followUp: `How many ways can you choose 2 toppings from 6? Does order matter?`,
  },
  {
    id: "cell-organelles",
    title: "Cell organelles",
    subjects: ["General Biology 1"],
    keywords: [
      "organelle",
      "organelles",
      "mitochondria",
      "ribosome",
      "nucleus",
      "chloroplast",
      "cell membrane",
      "golgi",
      "lysosome",
      "vacuole",
    ],
    body: String.raw`Key organelles and their jobs:
- **Nucleus**: stores DNA and controls cell activities.
- **Mitochondria**: site of cellular respiration; produces most ATP.
- **Ribosomes**: build proteins.
- **Rough ER**: folds and transports proteins; **smooth ER** makes lipids.
- **Golgi apparatus**: modifies, sorts, and packages proteins.
- **Lysosomes**: break down waste and worn-out parts.
- **Chloroplasts** (plants): carry out photosynthesis.
- **Cell membrane**: controls what enters and leaves.`,
    realWorld: "A cell is a factory: mitochondria are the power plants, ribosomes are the assembly lines, and the Golgi is the shipping department.",
    followUp: `Which organelle would be most active in a muscle cell that needs a lot of energy? Why?`,
  },
  {
    id: "cell-theory",
    title: "Cell theory and cell types",
    subjects: ["General Biology 1"],
    keywords: [
      "cell theory",
      "prokaryote",
      "eukaryote",
      "plant cell",
      "animal cell",
      "cell",
    ],
    body: String.raw`Cell theory says:
1. All living things are made of one or more cells.
2. The cell is the basic unit of life.
3. All cells come from pre-existing cells.

Prokaryotes (bacteria) have no membrane-bound nucleus; eukaryotes (plants, animals, fungi, protists) do. Plant cells have a cell wall, chloroplasts, and a large central vacuole; animal cells do not.`,
    followUp: `Name two structures a plant cell has that an animal cell does not.`,
  },
  {
    id: "cellular-respiration",
    title: "Cellular respiration",
    subjects: BIO,
    keywords: [
      "cellular respiration",
      "glycolysis",
      "krebs",
      "electron transport",
      "atp",
      "fermentation",
      "aerobic",
      "anaerobic",
    ],
    body: String.raw`Cellular respiration releases energy from glucose:
$$\text{C}_6\text{H}_{12}\text{O}_6+6\text{O}_2\to6\text{CO}_2+6\text{H}_2\text{O}+\text{ATP}.$$
Stages:
1. **Glycolysis** (cytoplasm): glucose → 2 pyruvate, net 2 ATP and 2 NADH.
2. **Krebs cycle** (mitochondrial matrix): produces NADH, FADH$_2$, and a little ATP.
3. **Electron transport chain** (inner mitochondrial membrane): most ATP is made here using oxygen as the final electron acceptor.

Fermentation happens without oxygen and produces far less ATP.`,
    realWorld: "Cellular respiration is a cell converting glucose into spendable energy, like turning cash into load credits.",
    followUp: `Which stage produces the most ATP, and why does it need oxygen?`,
  },
  {
    id: "mendelian-genetics",
    title: "Mendelian genetics",
    subjects: ["General Biology 2"],
    keywords: [
      "mendel",
      "mendelian",
      "punnett",
      "genotype",
      "phenotype",
      "dominant",
      "recessive",
      "allele",
      "monohybrid",
      "dihybrid",
    ],
    body: String.raw`Mendel's laws:
- **Law of segregation**: each organism has two alleles for a trait, and they separate during gamete formation.
- **Law of independent assortment**: genes for different traits assort independently.

Use a Punnett square. A monohybrid cross $Aa \times Aa$ gives genotype ratio $1AA:2Aa:1aa$ and phenotype ratio $3:1$ when $A$ is dominant.`,
    realWorld: "Punnett squares predict offspring traits the way a coin-flip table predicts heads and tails over many tosses.",
    followUp: String.raw`Cross $Aa \times Aa$. What fraction of offspring show the recessive phenotype?`,
  },
  {
    id: "hardy-weinberg",
    title: "Hardy–Weinberg equilibrium",
    subjects: ["General Biology 2"],
    keywords: [
      "hardy weinberg",
      "hardy-weinberg",
      "allele frequency",
      "gene pool",
      "p2",
      "2pq",
      "q2",
    ],
    body: String.raw`Hardy–Weinberg equilibrium describes allele frequencies in a population that is not evolving:
$$p+q=1,\qquad p^2+2pq+q^2=1,$$
where $p$ is the dominant allele frequency and $q$ is the recessive allele frequency. $p^2$ is homozygous dominant, $2pq$ is heterozygous, and $q^2$ is homozygous recessive.`,
    realWorld: "Hardy–Weinberg is a baseline: if allele frequencies stay put across generations, nothing evolutionary is pushing on that gene pool.",
    followUp: `If $q=0.3$, find $p$, $p^2$, $2pq$, and $q^2$.`,
  },
  {
    id: "evolution",
    title: "Evolution and natural selection",
    subjects: ["General Biology 2", "Earth and Life Science"],
    keywords: [
      "evolution",
      "natural selection",
      "speciation",
      "adaptation",
      "fossil",
      "common ancestor",
      "survival of the fittest",
    ],
    body: String.raw`Natural selection is the main mechanism of evolution:
1. Individuals in a population vary.
2. Some variations are heritable.
3. More offspring are produced than can survive.
4. Individuals with favorable traits survive and reproduce more.

Over generations, allele frequencies change. Evidence includes fossils, homologous structures, embryology, biogeography, and molecular/DNA similarities.`,
    realWorld: "Antibiotic resistance is natural selection happening in real time: the surviving bacteria reproduce and pass on their resistance.",
    followUp: `How does natural selection explain antibiotic resistance in bacteria?`,
  },
  {
    id: "atomic-structure",
    title: "Atomic structure",
    subjects: ["General Chemistry 1"],
    keywords: [
      "atom",
      "proton",
      "neutron",
      "electron",
      "atomic number",
      "mass number",
      "isotope",
      "electron configuration",
      "valence electron",
    ],
    body: String.raw`An atom has protons (positive, in the nucleus), neutrons (neutral, in the nucleus), and electrons (negative, in orbitals around the nucleus).

- Atomic number $Z$ = number of protons.
- Mass number $A$ = protons + neutrons.
- Isotopes have the same $Z$ but different numbers of neutrons.
- In a neutral atom, electrons = protons.

Electron configuration fills orbitals in order: $1s,2s,2p,3s,3p,4s,3d,\dots$`,
    realWorld: "An atom is a tiny solar system: a dense nucleus in the middle and electrons in the space around it.",
    followUp: String.raw`How many protons, neutrons, and electrons does $^{23}_{11}\text{Na}$ have?`,
  },
  {
    id: "mole-concept",
    title: "The mole concept",
    subjects: ["General Chemistry 1"],
    keywords: [
      "mole",
      "avogadro",
      "molar mass",
      "stoichiometry",
      "limiting reactant",
      "percent yield",
      "mole conversion",
    ],
    body: String.raw`A mole is Avogadro's number of particles:
$$1\ \text{mol}=6.022\times10^{23}\ \text{particles}.$$
Molar mass $M$ is the mass of one mole in g/mol. The key conversion is
$$n=\frac{m}{M}.$$
For stoichiometry, use the balanced equation's mole ratios. If a reactant runs out first, it is the limiting reactant.`,
    realWorld: String.raw`A dozen is 12 items; a mole is $6.022\times10^{23}$ particles. Same idea, much bigger batch.`,
    followUp: String.raw`How many moles are in $18\ \text{g}$ of water, with $M=18.02\ \text{g/mol}$?`,
  },
  {
    id: "chemical-kinetics",
    title: "Chemical kinetics",
    subjects: ["General Chemistry 2"],
    keywords: [
      "chemical kinetics",
      "reaction rate",
      "rate law",
      "activation energy",
      "catalyst",
      "order of reaction",
    ],
    body: String.raw`Chemical kinetics studies reaction rates. Rate depends on concentration, temperature, surface area, and catalysts.

A rate law has the form
$$\text{rate}=k[A]^m[B]^n,$$
where $m$ and $n$ are determined experimentally, not from the balanced equation. The overall order is $m+n$. Higher temperature increases the fraction of molecules with enough activation energy.`,
    realWorld: "Food spoils faster outside the fridge because higher temperature speeds up reaction rates.",
    followUp: `If the rate doubles when $[A]$ doubles while $[B]$ is constant, what is the order with respect to $A$?`,
  },
  {
    id: "chemical-equilibrium",
    title: "Chemical equilibrium",
    subjects: ["General Chemistry 2"],
    keywords: [
      "chemical equilibrium",
      "equilibrium constant",
      "le chatelier",
      "le chateliers",
      "kc",
      "kp",
      "reversible reaction",
    ],
    body: String.raw`At equilibrium, the forward and reverse reaction rates are equal, so concentrations stay constant. The equilibrium constant is
$$K_c=\frac{[C]^c[D]^d}{[A]^a[B]^b}$$
for $aA+bB\rightleftharpoons cC+dD$.

$K>1$ favors products; $K<1$ favors reactants. Le Chatelier's principle: if a stress is applied, the system shifts to counteract it.`,
    realWorld: "A busy seesaw stays level when both sides push equally — equilibrium is that balance, not a stop.",
    followUp: `For $K_c=100$, are products or reactants favored? What happens if you add more reactant?`,
  },
  {
    id: "kinematics",
    title: "Kinematics",
    subjects: ["General Physics 1"],
    keywords: [
      "kinematics",
      "displacement",
      "velocity",
      "speed",
      "acceleration",
      "projectile",
      "free fall",
      "kinematic equation",
    ],
    body: String.raw`Kinematics describes motion without worrying about forces. Key quantities: displacement (vector), velocity (vector), speed (scalar), and acceleration (vector).

For constant acceleration:
$$v=v_0+at,\qquad x=x_0+v_0t+\frac12at^2,\qquad v^2=v_0^2+2a(x-x_0).$$
For free fall, use $a=-9.8\ \text{m/s}^2$ (taking up as positive).`,
    realWorld: "On a jeepney's distance-time graph, the slope is speed, and a curving slope means it is accelerating.",
    followUp: String.raw`A ball is dropped from rest. How far does it fall in $2\ \text{s}$?`,
  },
  {
    id: "newtons-laws",
    title: "Newton's laws of motion",
    subjects: ["General Physics 1"],
    keywords: [
      "newton",
      "newton's law",
      "inertia",
      "force",
      "free body diagram",
      "net force",
      "action reaction",
      "friction",
      "equilibrium",
    ],
    body: String.raw`Newton's laws:
1. **Inertia**: an object keeps its state of motion unless a net external force acts.
2. **$F=ma$**: net force causes acceleration in the same direction.
3. **Action-reaction**: every force has an equal and opposite force on a different object.

For problems, draw a free-body diagram, choose axes, write $\sum F_x=ma_x$ and $\sum F_y=ma_y$, then solve.`,
    realWorld: "A loaded cart is harder to push than an empty one: same push, more mass, less acceleration.",
    followUp: String.raw`A $2\ \text{kg}$ cart has a net force of $10\ \text{N}$. What is its acceleration?`,
  },
  {
    id: "electricity-magnetism",
    title: "Electricity and magnetism",
    subjects: ["General Physics 2"],
    keywords: [
      "coulomb",
      "electric field",
      "electric force",
      "ohm",
      "ohm's law",
      "circuit",
      "current",
      "voltage",
      "resistance",
      "magnetism",
      "magnetic field",
      "induction",
    ],
    body: String.raw`Coulomb's law gives the electric force between two charges:
$$F=k\frac{|q_1q_2|}{r^2}.$$
Electric field is $E=\frac{F}{q}$. For circuits, Ohm's law is $V=IR$, and power is $P=IV$. In series, current is the same and resistances add; in parallel, voltage is the same and $\frac{1}{R_{\text{eq}}}=\sum\frac{1}{R_i}$.`,
    realWorld: "A phone charger moves charge through a circuit, and the cable's magnetic field is why it can interfere with nearby speakers.",
    followUp: `If you double the distance between two charges, what happens to the electric force?`,
  },
  {
    id: "optics",
    title: "Optics",
    subjects: ["General Physics 2"],
    keywords: [
      "optics",
      "lens",
      "mirror",
      "refraction",
      "reflection",
      "focal length",
      "snell",
      "image distance",
    ],
    body: String.raw`For mirrors and lenses, use
$$\frac{1}{f}=\frac{1}{d_o}+\frac{1}{d_i},$$
where $f$ is focal length, $d_o$ is object distance, and $d_i$ is image distance. Magnification is $m=-\frac{d_i}{d_o}$ (with the usual sign conventions).

Snell's law for refraction: $n_1\sin\theta_1=n_2\sin\theta_2$.`,
    realWorld: "A magnifying glass bending light to a focus is refraction doing the same job as a lens in your eye.",
    followUp: `An object is placed beyond the focal point of a converging lens. Is the image real or virtual?`,
  },
  {
    id: "plate-tectonics",
    title: "Plate tectonics and the rock cycle",
    subjects: ["Earth and Life Science"],
    keywords: [
      "plate tectonics",
      "earthquake",
      "volcano",
      "fault",
      "continental drift",
      "rock cycle",
      "divergent",
      "convergent",
      "transform boundary",
    ],
    body: String.raw`Earth's lithosphere is broken into plates that move on the asthenosphere. At **divergent** boundaries, plates move apart (mid-ocean ridges, rift valleys). At **convergent** boundaries, plates collide (mountains, trenches, volcanoes). At **transform** boundaries, plates slide past each other (faults, earthquakes).

The rock cycle connects igneous, sedimentary, and metamorphic rocks through melting, weathering, erosion, deposition, and heat/pressure.`,
    realWorld: "The Philippines sits on moving plates, which is why it has earthquakes, volcanoes, and mountain ranges.",
    followUp: `What type of plate boundary is most likely to produce a volcano? Why?`,
  },
  {
    id: "earth-systems",
    title: "Earth's systems",
    subjects: ["Earth and Life Science"],
    keywords: [
      "geosphere",
      "hydrosphere",
      "atmosphere",
      "biosphere",
      "earth systems",
      "weather",
      "climate",
    ],
    body: String.raw`Earth has four interacting spheres:
- **Geosphere**: rocks, minerals, and interior.
- **Hydrosphere**: water in all forms.
- **Atmosphere**: gases surrounding Earth.
- **Biosphere**: living organisms.

Changes in one sphere affect the others. For example, volcanic eruptions (geosphere) release gases into the atmosphere, which can affect climate and living things.`,
    realWorld: "A volcanic eruption links all four spheres: lava from the geosphere, gases into the atmosphere, ash into water, and effects on the biosphere.",
    followUp: `Give one example of the hydrosphere affecting the biosphere.`,
  },
  {
    id: "life-processes",
    title: "Life processes",
    subjects: ["Earth and Life Science"],
    keywords: [
      "life process",
      "photosynthesis",
      "homeostasis",
      "ecosystem",
      "nutrition",
      "excretion",
    ],
    body: String.raw`Life processes include nutrition, transport, respiration, excretion, regulation, growth, and reproduction. Photosynthesis and cellular respiration are complementary:
$$6\text{CO}_2+6\text{H}_2\text{O}\to\text{C}_6\text{H}_{12}\text{O}_6+6\text{O}_2$$
(photosynthesis), while cellular respiration reverses it to release energy.`,
    realWorld: "Photosynthesis and cellular respiration are two directions of the same energy exchange, like charging and using a power bank.",
    followUp: `How are photosynthesis and cellular respiration connected in an ecosystem?`,
  },
  {
    id: "research-question",
    title: "Writing a research question",
    subjects: ["Research 1", "Research 2"],
    keywords: [
      "research question",
      "research problem",
      "qualitative research",
      "open ended",
      "topic",
    ],
    body: String.raw`A strong qualitative research question is open-ended, focused, and answerable with words and observations rather than numbers. It usually starts with "how" or "why."

Weak: "Do students like online classes?"
Stronger: "How do Grade 11 students describe their motivation during online classes?"

A research problem should identify a real gap or issue, and the question should narrow it enough to study.`,
    realWorld: "A good research question is a flashlight, not a floodlight: narrow enough to show one thing clearly.",
    followUp: `Turn this into a qualitative research question: "Students struggle with time management."`,
  },
  {
    id: "research-methods",
    title: "Research methods and sources",
    subjects: RESEARCH,
    keywords: [
      "methodology",
      "sampling",
      "interview",
      "focus group",
      "observation",
      "literature review",
      "citation",
      "apa",
    ],
    body: String.raw`Qualitative methods include interviews, focus groups, observations, and case studies. Sampling can be purposive (chosen for a reason) or convenience-based.

A literature review summarizes what is already known and shows the gap your study addresses. Always cite sources properly (APA is common) and distinguish your ideas from others'.`,
    realWorld: "An interview is a conversation with a purpose, while a survey is the same questions asked the same way to many people.",
    followUp: `Which qualitative method would best capture students' experiences, and why?`,
  },
  {
    id: "quantitative-design",
    title: "Quantitative research design",
    subjects: ["Research 2", "Capstone Project"],
    keywords: [
      "quantitative research",
      "independent variable",
      "dependent variable",
      "hypothesis",
      "experimental design",
      "control group",
      "correlation",
      "regression",
    ],
    body: String.raw`In quantitative research, variables must be operationalized — defined in a way you can measure.

- **Independent variable**: what you change or group by.
- **Dependent variable**: what you measure.
- **Controlled variables**: kept constant to avoid confounding.

Experimental designs test cause and effect with manipulation and control groups. Correlational designs describe relationships but do not prove causation.`,
    realWorld: "Testing a new study technique on two groups — one using it, one not — is an experiment; just measuring both is correlational.",
    followUp: `In a study of study time and quiz scores, which is the independent variable?`,
  },
  {
    id: "capstone-proposal",
    title: "Capstone project proposals",
    subjects: ["Capstone Project"],
    keywords: [
      "capstone",
      "project proposal",
      "problem statement",
      "objective",
      "feasibility",
      "prototype",
    ],
    body: String.raw`A capstone proposal usually has a clear problem statement, objectives, significance, scope and limitations, methodology, and a timeline.

Make the problem **specific and measurable**. Instead of "improve school waste management," try "reduce the amount of single-use plastic in the canteen by 30% over four weeks using labeled segregation bins."

Your method should match your objective, and your scope should be realistic for the time and resources you have.`,
    realWorld: "A capstone proposal is a blueprint: it shows what you will build, why it matters, and how you will know it worked.",
    followUp: `What problem in your school or community could you measure before and after your project?`,
  },
  {
    id: "credible-sources",
    title: "Evaluating online sources",
    subjects: ["Empowerment Technologies"],
    keywords: [
      "credible",
      "credible source",
      "online source",
      "website",
      "website credibility",
      "source",
      "authority",
      "accuracy",
      "currency",
      "objectivity",
      "digital literacy",
    ],
    body: String.raw`To check whether an online source is credible, use these filters:
- **Authority**: who wrote it, and what are their credentials?
- **Accuracy**: is it supported by evidence and citations?
- **Currency**: when was it published or updated?
- **Objectivity**: is it trying to inform or persuade or sell?
- **Purpose**: why does the site exist?

Prefer government, academic, and reputable news sources over anonymous blogs.`,
    realWorld: "Checking a website is like checking a news tip: who says it, how do they know, and when was it said?",
    followUp: `Pick a website you used recently. Which credibility check would it fail, if any?`,
  },
  {
    id: "sts",
    title: "Science, technology, and society",
    subjects: ["Science, Technology and Society"],
    keywords: [
      "science technology and society",
      "sts",
      "social change",
      "technological innovation",
      "innovation",
      "technology",
      "society",
      "technology and society",
    ],
    body: String.raw`Science, Technology and Society studies how scientific knowledge and technological innovation interact with society.

A useful frame:
1. What is the scientific discovery or technology?
2. Who benefits, and who bears the risks?
3. What social, ethical, environmental, or economic effects follow?
4. How should it be regulated or guided?

Technologies are not neutral — they shape how people live, work, and communicate.`,
    realWorld: "A smartphone is not just a tool: it changed how people work, pay, date, and protest.",
    followUp: `Pick one technology you use daily. Who benefits most from it, and what is one risk?`,
  },
];

/**
 * Function names are strong signals: "derivative of sin(2x)" should reach the
 * trig-derivatives note instead of the generic derivative definition.
 */
const FUNCTION_NAME_KEYWORDS = new Set([
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "sqrt",
  "log",
  "ln",
]);

export function findConceptNote(
  subject: string,
  message: string
): ConceptNote | null {
  const normalized = normalize(message);
  const tokens = new Set(tokenize(message));
  if (tokens.size === 0) return null;

  let bestNote: ConceptNote | null = null;
  let bestScore = 0;

  for (const note of NOTES) {
    if (!note.subjects.includes(subject)) continue;

    let score = 0;
    for (const keyword of note.keywords) {
      const phrase = normalize(keyword);
      if (!phrase) continue;

      if (phrase.includes(" ")) {
        if (containsPhrase(normalized, phrase)) score += 4;
      } else if (tokens.has(stemToken(phrase))) {
        score += FUNCTION_NAME_KEYWORDS.has(phrase) ? 3 : 2;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestNote = note;
    }
  }

  return bestScore >= 2 ? bestNote : null;
}
