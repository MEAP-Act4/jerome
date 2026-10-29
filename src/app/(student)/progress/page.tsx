"use client";

import { Flame, Trophy, Target, TrendingUp } from "lucide-react";

const chartData = [
	{ day: "Mon", value: 12, isToday: true },
	{ day: "Tue", value: 18, isToday: false },
	{ day: "Wed", value: 9, isToday: false },
	{ day: "Thu", value: 24, isToday: false },
	{ day: "Fri", value: 16, isToday: false },
	{ day: "Sat", value: 21, isToday: false },
	{ day: "Sun", value: 7, isToday: false },
];

const maxValue = Math.max(...chartData.map((d) => d.value));
const chartHeight = 260;
const chartTop = 30;
const chartBottom = chartTop + chartHeight;
const barWidth = 50;
const chartLeft = 70;
const chartRight = 700;
const gap = (chartRight - chartLeft - chartData.length * barWidth) / (chartData.length - 1);
const scale = chartHeight / maxValue;

const gridLines = [0, 6, 12, 18, 24];

export default function ProgressPage() {
	return (
		<div className="mx-auto max-w-[1200px] space-y-6">
			<section className="flex flex-wrap items-start justify-between gap-6">
				<div>
					<p className="eyebrow mb-2">Your Learning Journey</p>
					<h1 className="font-serif text-3xl font-semibold tracking-tight text-green-950">
						Progress
					</h1>
					<p className="mt-1.5 max-w-md text-sm leading-relaxed text-text-muted">
						Track your practice consistency, streaks, and question
						volume over time.
					</p>
				</div>
				<div className="rounded-card bg-green-950 px-6 py-4 text-cream-50">
					<p className="font-mono text-[11px] uppercase tracking-[0.12em] text-cream-50/60">
						This week
					</p>
					<p className="mt-1 font-serif text-3xl font-semibold text-lime-400">
						107
					</p>
					<p className="text-xs text-cream-50/60">questions answered</p>
				</div>
			</section>

			<section className="card p-6 lg:p-8">
				<div className="mb-6 flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="eyebrow mb-0.5">Daily Activity</p>
						<h2 className="font-serif text-xl font-semibold text-green-950">
							This week&apos;s practice
						</h2>
					</div>
					<div className="flex items-center gap-2">
						<svg width="14" height="14" aria-hidden="true">
							<defs>
								<pattern
									id="legend-pattern"
									patternUnits="userSpaceOnUse"
									width="4"
									height="4"
									patternTransform="rotate(45)"
								>
									<rect width="4" height="4" fill="#CFEB89" />
									<line
										x1="0"
										y1="0"
										x2="0"
										y2="4"
										stroke="#143D30"
										strokeWidth="0.8"
										strokeOpacity="0.2"
									/>
								</pattern>
							</defs>
							<rect
								width="14"
								height="14"
								rx="3"
								fill="url(#legend-pattern)"
							/>
						</svg>
						<span className="text-xs font-medium text-text-muted">Today</span>
					</div>
				</div>

				<svg
					viewBox="0 0 720 340"
					className="w-full"
					role="img"
					aria-label="Bar chart showing questions answered each day of the week. Monday: 12, Tuesday: 18, Wednesday: 9, Thursday: 24, Friday: 16, Saturday: 21, Sunday: 7."
				>
					<defs>
						<pattern
							id="bar-diagonal"
							patternUnits="userSpaceOnUse"
							width="6"
							height="6"
							patternTransform="rotate(45)"
						>
							<rect width="6" height="6" fill="#CFEB89" />
							<line
								x1="0"
								y1="0"
								x2="0"
								y2="6"
								stroke="#143D30"
								strokeWidth="1"
								strokeOpacity="0.15"
							/>
						</pattern>
					</defs>

					{gridLines.map((v) => {
						const y = chartBottom - v * scale;
						return (
							<g key={v}>
								<line
									x1={chartLeft}
									y1={y}
									x2={chartRight}
									y2={y}
									stroke="#DDE2DC"
									strokeWidth="1"
									strokeDasharray="4 4"
								/>
								<text
									x={chartLeft - 10}
									y={y + 4}
									textAnchor="end"
									fontSize="11"
									fontFamily="DM Mono, monospace"
									fill="#67716C"
								>
									{v}
								</text>
							</g>
						);
					})}

					<text
						x={20}
						y={chartTop + chartHeight / 2}
						textAnchor="middle"
						fontSize="11"
						fontFamily="DM Mono, monospace"
						fill="#67716C"
						transform={`rotate(-90, 20, ${chartTop + chartHeight / 2})`}
						letterSpacing="2"
					>
						QUESTIONS ANSWERED
					</text>

					{chartData.map((d, i) => {
						const x = chartLeft + i * (barWidth + gap);
						const h = d.value * scale;
						const y = chartBottom - h;
						return (
							<g key={d.day}>
								<rect
									x={x}
									y={y}
									width={barWidth}
									height={h}
									rx="6"
									fill={d.isToday ? "url(#bar-diagonal)" : "#143D30"}
								/>
								<text
									x={x + barWidth / 2}
									y={y - 8}
									textAnchor="middle"
									fontSize="13"
									fontWeight="600"
									fontFamily="Manrope, sans-serif"
									fill={d.isToday ? "#1E6047" : "#18201D"}
								>
									{d.value}
								</text>
								<text
									x={x + barWidth / 2}
									y={chartBottom + 20}
									textAnchor="middle"
									fontSize="12"
									fontFamily="DM Mono, monospace"
									fill={d.isToday ? "#1E6047" : "#67716C"}
									fontWeight={d.isToday ? 600 : 400}
								>
									{d.day}
								</text>
							</g>
						);
					})}

					<text
						x={(chartLeft + chartRight) / 2}
						y={330}
						textAnchor="middle"
						fontSize="11"
						fontFamily="DM Mono, monospace"
						fill="#67716C"
						letterSpacing="2"
					>
						DAY OF THE WEEK
					</text>
				</svg>

				<p className="mt-4 rounded-xl bg-surface px-4 py-3 text-sm leading-relaxed text-text-primary">
					You practiced most on Thursday with 24 questions. You&apos;ve
					answered 107 questions across 7 active days.
				</p>
			</section>

			<div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
				<section className="card p-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100">
						<Flame className="h-5 w-5 text-orange-500" />
					</div>
					<p className="mt-4 font-serif text-3xl font-semibold text-green-950">
						12
					</p>
					<p className="mt-0.5 text-xs text-text-muted">Current streak</p>
				</section>

				<section className="card p-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100">
						<Trophy className="h-5 w-5 text-violet-500" />
					</div>
					<p className="mt-4 font-serif text-3xl font-semibold text-green-950">
						18
					</p>
					<p className="mt-0.5 text-xs text-text-muted">Longest streak</p>
				</section>

				<section className="card p-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
						<Target className="h-5 w-5 text-blue-500" />
					</div>
					<p className="mt-4 font-serif text-3xl font-semibold text-green-950">
						1,247
					</p>
					<p className="mt-0.5 text-xs text-text-muted">Total questions</p>
				</section>

				<section className="card p-5">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
						<TrendingUp className="h-5 w-5 text-green-900" />
					</div>
					<p className="mt-4 font-serif text-3xl font-semibold text-green-950">
						15.3
					</p>
					<p className="mt-0.5 text-xs text-text-muted">Average daily</p>
				</section>
			</div>
		</div>
	);
}
