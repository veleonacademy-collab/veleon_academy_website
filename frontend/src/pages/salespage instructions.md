Yes — for a mobile-first landing page, this is significantly too long.
From a conversion perspective, the issue isn't just the amount of content. It's that the page repeats the same persuasion points multiple times:


Outcome → repeated 3–4 times


Social proof → repeated 4+ times


"Who it's for" → repeated twice


CTA buttons → almost every section


Scarcity → countdown + seats left + closing soon + seats left again


Testimonials → Cornelius + Segun + Barry + Reviews section


Trainer credibility → coach card + mentor section


On mobile, most users won't reach the final checkout section.

What I would remove immediately
1. Remove the "Welcome / Who Is This Designed For" section
Current section:
{/* 2. WELCOME SECTION */}
Reason:
The hero already explains:

Graduate, Job Seeker, Young Professional, Tech Transitioner

Then later you have:
{/* 8. WHO IT IS FOR SECTION */}
which repeats the same thing.
Keep only ONE.
Recommendation: delete Section 2 completely.

2. Remove "Reality Check"
Current section:
{/* 3. REALITY CHECK SECTION */}
The:

99% of YouTube tutorials...


tutorial purgatory...

copy is interesting but adds scroll depth.
You already explain the solution later in the curriculum.
For mobile, I'd cut this entire section.

3. Remove one testimonial image block
You have:
Testimonial_segun.jpg
then later:
Testimonial_Barry.jpg
Both are standalone testimonial banners.
Keep only the strongest one.
Delete the weaker one.

4. Remove "Reviews Callout"
Current:
{/* 10. REVIEWS CALLOUT */}
This section exists only to say:

methodology is practical

and then show another CTA.
You already have:


Cornelius review


Segun review


Barry review


Reviews page link


Not needed.

5. Merge "Trainer" and "Quality Proof"
Current:
{/* 9. LEAD TRAINER */}
and
{/* 11. QUALITY PROOF */}
can become one section:
Meet Your Mentor


Coach bio


Capstone project requirement


CTA


This saves another full screen.

Biggest conversion issue
The curriculum section is too long.
Current:
TRACK 1TRACK 2TRACK 3TRACK 4
Each module has:


title


objection


description


For mobile that's a wall of text.
Convert to accordion:
Week 1-2 ExcelWeek 3-4 SQLWeek 5 Power BIWeek 6 AI + Monetization
Expand only when clicked.
This alone cuts page height by ~40%.

Grand Slam Offer section is oversized
Current:
Bonus 1Bonus 2Bonus 3Bonus 4Bonus 5
Each contains:


title


sub text


objection


value


Too much.
Mobile version:
✓ ATS Resume Templates (₦25k)✓ LinkedIn Optimization (₦30k)✓ Proposal Templates (₦20k)✓ Practice Datasets (₦25k)✓ VIP Support (₦50k)
Total value:
₦300k+
Today:
₦25,999
You can save 3–4 screens here.---# Reduce CTA frequencyI counted roughly 12–15 CTA buttons.That's excessive.For mobile:### CTA 1Hero### CTA 2After outcomes### CTA 3After offer stack### CTA 4Checkout sectionThat's enough.---# Recommended mobile structureIf this were my funnel:### Hero- Headline- Outcome- Countdown- CTA---### Who it's for4 avatar cards---### Results / Outcomes5 bullets---### TestimonialCornelius---### CurriculumAccordion---### Offer StackCompressed---### TrainerCoach bio---### GuaranteeDouble guarantee---### CheckoutEnrollment form---That's it.---# Code-level mobile optimizations### 1. Countdown updates every secondYou have:```tsxsetInterval(updateCountdown, 1000);
This forces re-renders every second across the page.
Move countdown into its own component:
<CountdownTimer />
so the whole landing page doesn't re-render every second.
Huge mobile performance win.

2. Large inline arrays recreated every render
You repeatedly do:
[ "item1", "item2", "item3"].map(...)
inside JSX.
Move these outside the component:
const outcomes = [...]const bonuses = [...]const modules = [...]
Less work on every render.

3. Too many gradients + blur effects
Examples:
blur-[150px]blur-[120px]blur-[100px]
These are expensive on lower-end Android phones.
Reduce them or hide some on mobile:
hidden sm:block

4. Excessive animations
You have:
anim-fade-upanim-fade-rightanim-scale-in
across nearly every section.
For mobile:
@media (max-width: 640px) {  .anim-fade-up,  .anim-scale-in,  .anim-right-0,  .anim-right-1 {    animation: none;  }}
Better scroll performance.

My estimate
Current mobile landing page:


~14–16 screens before checkout


Too much repetition


Users likely fatigue before reaching payment


Optimized version:


~7–8 screens before checkout


Same persuasion


Faster load


Better mobile conversion rate


The biggest wins are:


Remove Welcome section.


Remove Reality Check section.


Keep only 1–2 testimonials.


Compress Offer Stack.


Convert Curriculum into accordion.


Merge Trainer + Quality Proof.


Reduce CTA repetition.


That would likely cut the page length by 35–50% without losing any sales argument.