<script setup lang="ts">
import { computed } from 'vue'
import { appUrl, mobileAppUrls } from '../composables/useAppUrls'
import DsButton from './DsButton.vue'
import DsIcon from './DsIcon.vue'

export interface ProductLandingItem {
  icon: `solar:${string}`
  title: string
  description: string
}

export interface ProductLandingSpecimen {
  label: string
  value: string
  note: string
}

const props = defineProps<{
  kicker: string
  title: string
  accent: string
  description: string
  product: 'desk' | 'mail' | 'files'
  specimen: ProductLandingSpecimen
  heroImage?: string
  heroImageAlt?: string
  appImage?: string
  appImageAlt?: string
  outcomes: ProductLandingItem[]
  capabilities: ProductLandingItem[]
  closingTitle: string
  closingDescription: string
}>()

const emit = defineEmits<{ start: []; signIn: [] }>()

/* <wbr> marks break points without adding characters to what a reader
   copies. A mono address has no spaces, so it splits mid-token without it. */
const specimenParts = computed(() => props.specimen.value.split(/(?<=[@/])/))

const plans = [
  { name: 'Solo', mailboxes: '1 mailbox', storage: '2 GB shared storage', price: '$1', description: 'For an independent professional building a trusted identity.' },
  { name: 'Team', mailboxes: 'Up to 5 mailboxes', storage: '15 GB shared storage', price: '$3', description: 'For a small team ready to work under one business name.', featured: true },
  { name: 'Business', mailboxes: 'Up to 15 mailboxes', storage: '50 GB shared storage', price: '$8', description: 'For a growing operation that needs one clear workspace.' },
  { name: 'Growth', mailboxes: 'Up to 50 mailboxes', storage: '200 GB shared storage', price: '$24', description: 'For an established team bringing more people and work together.' }
]

const productNames = { desk: 'Desk', mail: 'Mail', files: 'Files' } as const
const productName = computed(() => productNames[props.product])

const suiteApps = [
  { id: 'desk', name: 'Desk', icon: '/desk-icon.svg', description: 'The day in one place: priority mail, recent files, and what is next.' },
  { id: 'mail', name: 'Mail', icon: '/mail-icon.svg', description: 'Business email on the domain your customers already trust.' },
  { id: 'files', name: 'Files', icon: '/files-icon.svg', description: 'Documents organised, reviewed, and shared without losing control.' },
  { id: 'calendar', name: 'Calendar', icon: '/calendar-icon.svg', description: 'Meetings and plans sitting beside the work they belong to.' }
] as const

const plateCaption = computed(() =>
  props.product === 'desk' ? 'Mail, Files, and Calendar' : 'in the Desk app'
)

const storeLinks = computed(() =>
  [
    { key: 'ios', label: 'App Store', url: mobileAppUrls.ios },
    { key: 'android', label: 'Google Play', url: mobileAppUrls.android }
  ].filter((store): store is { key: string; label: string; url: string } => Boolean(store.url))
)

const siblingApps = computed(() =>
  suiteApps.filter((app) => app.id !== props.product).map((app) => ({ ...app, url: appUrl(app.id) }))
)

const addons = [
  { label: '100 GB', price: '$5/month' },
  { label: '500 GB', price: '$20/month' },
  { label: '1 TB', price: '$35/month' },
  { label: 'Five mailboxes and 15 GB', price: '$3/month' }
]
</script>

<template>
  <main class="landing" :class="`landing--${product}`">
    <section class="hero" :class="{ 'hero--shot': heroImage }">
      <p class="hero__kicker">{{ kicker }}</p>
      <h1 class="hero__title">{{ title }} <span>{{ accent }}</span></h1>

      <div class="hero__media">
        <slot name="hero-media">
          <img v-if="heroImage" class="hero__shot" :src="heroImage" :alt="heroImageAlt" />
          <figure v-else class="specimen">
            <img class="specimen__mark" :src="`/${product}-icon.svg`" alt="" />
            <figcaption class="specimen__caption">
              <span class="specimen__label">{{ specimen.label }}</span>
              <span class="specimen__value"><template v-for="(part, index) in specimenParts" :key="index">{{ part }}<wbr v-if="index < specimenParts.length - 1" /></template></span>
              <span class="specimen__note">{{ specimen.note }}</span>
            </figcaption>
          </figure>
        </slot>
      </div>

      <p class="hero__lead">{{ description }}</p>

      <div class="hero__actions">
        <DsButton size="lg" icon="solar:arrow-right-linear" icon-position="end" @click="emit('start')">Get started</DsButton>
        <DsButton size="lg" variant="secondary" @click="emit('signIn')">Sign in</DsButton>
      </div>

      <ul class="hero__trust">
        <li><DsIcon name="solar:verified-check-bold-duotone" />Your own domain and identity</li>
        <li><DsIcon name="solar:lock-keyhole-minimalistic-bold-duotone" />Your data stays portable</li>
      </ul>
    </section>

    <section class="outcomes" aria-labelledby="outcomes-heading">
      <header class="band-heading">
        <p class="band-heading__label">What you get</p>
        <h2 id="outcomes-heading">Look established. Stay in control. Move with confidence.</h2>
      </header>
      <div class="outcome-grid">
        <article v-for="item in outcomes" :key="item.title" class="outcome">
          <span class="outcome__tile"><DsIcon :name="item.icon" /></span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section class="suite" aria-labelledby="suite-heading">
      <header class="band-heading">
        <p class="band-heading__label">One account, every app</p>
        <h2 id="suite-heading">Your work does not stop at {{ productName }}.</h2>
        <p class="band-heading__lead">Every WhileSmart app signs in with the same account and draws on the same storage pool. Turn one on when you need it, not before.</p>
      </header>
      <ul class="suite-grid">
        <li v-for="app in siblingApps" :key="app.id">
          <a :href="app.url">
            <img :src="app.icon" alt="" />
            <span class="suite__text">
              <strong>{{ app.name }}</strong>
              <small>{{ app.description }}</small>
            </span>
            <DsIcon name="solar:arrow-right-up-linear" />
          </a>
        </li>
      </ul>
    </section>

    <section class="mobile" aria-labelledby="mobile-heading">
      <div class="mobile__inner">
        <div class="mobile__copy">
          <p class="band-heading__label">On iPhone and Android</p>
          <h2 id="mobile-heading">The same account, in your pocket.</h2>
          <p class="mobile__lead">The WhileSmart Desk app bundles Mail, Files, and Calendar in one download. Sign in once and carry on from wherever you stopped.</p>

          <div v-if="storeLinks.length" class="mobile__stores">
            <a
              v-for="store in storeLinks"
              :key="store.key"
              class="store-link"
              :href="store.url"
              target="_blank"
              rel="noopener noreferrer"
            >
              <DsIcon name="solar:download-minimalistic-linear" />{{ store.label }}
            </a>
          </div>
          <p v-else class="mobile__availability">
            <DsIcon name="solar:smartphone-linear" />Available for iPhone and Android.
          </p>
        </div>

        <div class="mobile__device" aria-hidden="true">
          <div class="phone">
            <span class="phone__notch"></span>
            <div class="phone__screen">
              <img v-if="appImage" :src="appImage" :alt="appImageAlt" />
              <div v-else class="phone__plate">
                <img :src="`/${product}-icon.svg`" alt="" />
                <strong>{{ productName }}</strong>
                <small>{{ plateCaption }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="capabilities" aria-labelledby="capabilities-heading">
      <div class="capabilities__inner">
        <header class="capabilities__intro">
          <p class="band-heading__label">One clear system</p>
          <h2 id="capabilities-heading">Tools that help you work, not tools you have to manage.</h2>
          <p class="capabilities__lead">Everything runs on one account, one bill, and standards you can walk away from.</p>
        </header>
        <ul class="capability-list">
          <li v-for="item in capabilities" :key="item.title">
            <span class="capability__tile"><DsIcon :name="item.icon" /></span>
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <section class="pricing" aria-labelledby="pricing-heading">
      <header class="band-heading">
        <p class="band-heading__label">Simple group billing</p>
        <h2 id="pricing-heading">One price for the mailboxes your team needs.</h2>
        <p class="band-heading__lead">Every paid plan includes professional Mail, Files, Calendar, and a custom domain. Add another pack when your team grows.</p>
      </header>

      <div class="pricing-grid">
        <article v-for="plan in plans" :key="plan.name" class="plan" :class="{ 'plan--featured': plan.featured }">
          <span v-if="plan.featured" class="plan__badge">Best place to start</span>
          <h3 class="plan__name">{{ plan.name }}</h3>
          <p class="plan__seats">{{ plan.mailboxes }}</p>
          <p class="plan__price"><strong>{{ plan.price }}</strong><span>per month</span></p>
          <p class="plan__summary">{{ plan.description }}</p>
          <ul class="plan__features">
            <li><DsIcon name="solar:check-circle-bold-duotone" />{{ plan.storage }}</li>
            <li><DsIcon name="solar:check-circle-bold-duotone" />Professional business email</li>
            <li><DsIcon name="solar:check-circle-bold-duotone" />Files and protected sharing</li>
            <li><DsIcon name="solar:check-circle-bold-duotone" />Calendar and one account</li>
          </ul>
          <DsButton :variant="plan.featured ? 'primary' : 'secondary'" full-width @click="emit('start')">Choose {{ plan.name }}</DsButton>
        </article>
      </div>

      <div class="addons">
        <p class="addons__title">Grow without changing plans</p>
        <dl class="addons__list">
          <div v-for="addon in addons" :key="addon.label">
            <dt>{{ addon.label }}</dt>
            <dd>{{ addon.price }}</dd>
          </div>
        </dl>
      </div>
    </section>

    <section class="closing">
      <div class="closing__card">
        <div class="closing__copy">
          <p class="closing__label">Start with what you need</p>
          <h2>{{ closingTitle }}</h2>
          <p class="closing__lead">{{ closingDescription }}</p>
        </div>
        <DsButton size="lg" variant="secondary" icon="solar:arrow-right-linear" icon-position="end" @click="emit('start')">Create your account</DsButton>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* The fill and ink forms are not interchangeable: the mail cyan and the files
   green both fall under 4.5:1 on white, so only ink is safe as text. */
.landing {
  --accent-fill: var(--ds-color-primary);
  --accent-ink: var(--ds-color-primary);
  --accent-wash: var(--ds-color-primary-50);
  --accent-on-dark: var(--ds-color-secondary-300);
  --band-max: 80rem;
  --hero-rail: max(var(--ds-space-8), calc((100% - var(--band-max)) / 2));
  --product-mark: url('/desk-icon.svg');
  color: var(--ds-color-neutral-900);
}

.landing--mail {
  --accent-fill: var(--ds-color-secondary-500);
  --accent-ink: var(--ds-color-secondary-900);
  --accent-wash: var(--ds-color-secondary-50);
  --accent-on-dark: var(--ds-color-secondary-300);
  --product-mark: url('/mail-icon.svg');
}

.landing--files {
  --accent-fill: var(--ds-color-success-500);
  --accent-ink: var(--ds-color-success-700);
  --accent-wash: var(--ds-color-success-50);
  --accent-on-dark: var(--ds-color-success-300);
  --product-mark: url('/files-icon.svg');
}

:where(.landing) :where(h1, h2, h3, p, ul, dl, dd) {
  margin: 0;
}

:where(.landing) :where(ul) {
  padding: 0;
  list-style: none;
}

.hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  grid-template-areas:
    'kicker  media'
    'title   media'
    'lead    media'
    'actions media'
    'trust   media';
  align-content: center;
  gap: var(--ds-space-5) var(--ds-space-16);
  position: relative;
  overflow: hidden;
  padding: var(--ds-space-20) var(--hero-rail) var(--ds-space-24);
}

.hero::before {
  content: '';
  position: absolute;
  top: -7rem;
  right: -7rem;
  width: 36rem;
  height: 36rem;
  background: var(--accent-fill);
  -webkit-mask: var(--product-mark) no-repeat center / contain;
  mask: var(--product-mark) no-repeat center / contain;
  opacity: 0.16;
  pointer-events: none;
}

.hero--shot {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr);
}

/* The mark paints behind and around a screenshot rather than beside it. */
.hero--shot::before {
  display: none;
}

/* Fades the hero to white so the tinted band below starts on a hard edge.
   Without it two washes meet at the same lightness and read as one band. */
.hero::after {
  content: '';
  position: absolute;
  inset: 40% 0 0;
  background: linear-gradient(180deg, transparent, var(--ds-color-neutral-0));
  pointer-events: none;
}

.hero > * {
  position: relative;
  z-index: 1;
}

.hero__kicker {
  grid-area: kicker;
  align-self: end;
  color: var(--accent-ink);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.hero__title {
  grid-area: title;
  max-width: 22ch;
  font-size: clamp(2rem, 3.3vw, 2.75rem);
  line-height: 1.06;
  letter-spacing: -0.03em;
}

/* Block so the colour change lands on a line break instead of stranding the
   first accent words at the end of the line above. */
.hero__title span {
  display: block;
  color: var(--accent-ink);
}

.hero__lead {
  grid-area: lead;
  max-width: 38ch;
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-lg);
  line-height: var(--ds-leading-relaxed);
}

.hero__actions {
  grid-area: actions;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-3);
  margin-top: var(--ds-space-2);
}

.hero__trust {
  grid-area: trust;
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-2) var(--ds-space-5);
  margin-top: var(--ds-space-2);
  padding-top: var(--ds-space-5);
  border-top: 1px solid var(--ds-border-base);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.hero__trust li {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-2);
}

.hero__trust :deep(svg) {
  width: 1.15rem;
  height: 1.15rem;
  color: var(--accent-ink);
}

.hero__media {
  display: grid;
  place-items: center;
  grid-area: media;
  align-self: center;
}

.hero__shot {
  display: block;
  width: 100%;
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  box-shadow: var(--ds-elevation-4);
}

.specimen {
  display: grid;
  gap: var(--ds-space-5);
  width: 100%;
  margin: 0;
  padding: var(--ds-space-8);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-neutral-0);
  box-shadow: var(--ds-elevation-5);
}

.specimen__mark {
  width: 3.5rem;
  height: 3.5rem;
}

.specimen__caption {
  display: grid;
  gap: var(--ds-space-2);
}

.specimen__label {
  color: var(--accent-ink);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.specimen__value {
  color: var(--ds-color-neutral-900);
  font-family: var(--ds-font-mono);
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  font-weight: var(--ds-font-weight-medium);
  letter-spacing: -0.02em;
  overflow-wrap: anywhere;
}

.specimen__note {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
  line-height: var(--ds-leading-relaxed);
}

.band-heading {
  max-width: var(--band-max);
  margin: 0 auto var(--ds-space-10);
}

.band-heading__label {
  color: var(--accent-ink);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.band-heading h2,
.capabilities__intro h2 {
  max-width: 28ch;
  margin-top: var(--ds-space-3);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.14;
  letter-spacing: -0.025em;
}

.band-heading__lead {
  max-width: 46ch;
  margin-top: var(--ds-space-4);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-lg);
  line-height: var(--ds-leading-relaxed);
}

.outcomes {
  padding: var(--ds-space-24) var(--ds-space-8);
  /* Built from the ink form, not the fill: a cyan or green tint barely drops
     in value, so a fill-based wash reads as the same band as the hero. */
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent-ink) 10%, transparent),
    color-mix(in srgb, var(--accent-ink) 18%, transparent)
  );
}

.outcome-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ds-space-5);
  max-width: var(--band-max);
  margin: 0 auto;
}

.outcome {
  display: grid;
  align-content: start;
  justify-items: center;
  gap: var(--ds-space-3);
  text-align: center;
  padding: var(--ds-space-8);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-neutral-0);
  box-shadow: var(--ds-elevation-2);
}

.outcome__tile {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  margin-bottom: var(--ds-space-3);
  border-radius: var(--ds-radius-lg);
  background: var(--accent-wash);
  color: var(--accent-ink);
}

.outcome__tile :deep(svg) {
  width: 1.6rem;
  height: 1.6rem;
}

.outcome h3 {
  font-size: var(--ds-text-xl);
}

.outcome p {
  color: var(--ds-color-neutral-600);
  line-height: var(--ds-leading-relaxed);
}

.suite {
  padding: var(--ds-space-24) var(--ds-space-8);
  background: var(--ds-color-neutral-0);
}

.suite-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--ds-space-4);
  max-width: var(--band-max);
  margin: 0 auto;
}

.suite-grid a {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--ds-space-4);
  height: 100%;
  padding: var(--ds-space-6);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  color: inherit;
  text-decoration: none;
  transition: border-color var(--ds-transition-base), box-shadow var(--ds-transition-base);
}

.suite-grid a:hover {
  border-color: var(--accent-fill);
  box-shadow: var(--ds-elevation-2);
}

.suite-grid img {
  width: 2.5rem;
  height: 2.5rem;
}

.suite__text {
  display: grid;
  gap: var(--ds-space-1);
}

.suite__text strong {
  font-size: var(--ds-text-lg);
}

.suite__text small {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
  line-height: var(--ds-leading-relaxed);
}

.suite-grid a > :deep(svg) {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--accent-ink);
}

/* overflow crops the phone at the band edge; without it the phone runs on
   into the section below. */

.mobile {
  overflow: hidden;
  padding: var(--ds-space-16) var(--ds-space-8) 0;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--accent-ink) 10%, transparent),
    color-mix(in srgb, var(--accent-ink) 18%, transparent)
  );
}

.mobile__inner {
  display: grid;
  grid-template-columns: minmax(0, 30rem) minmax(0, 1fr);
  align-items: end;
  justify-items: end;
  gap: var(--ds-space-10);
  max-width: var(--band-max);
  margin: 0 auto;
}

.mobile__copy {
  padding-bottom: var(--ds-space-24);
}

.mobile__copy h2 {
  max-width: 20ch;
  margin-top: var(--ds-space-3);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  line-height: 1.14;
  letter-spacing: -0.025em;
}

.mobile__lead {
  margin-top: var(--ds-space-4);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-lg);
  line-height: var(--ds-leading-relaxed);
}

.mobile__stores {
  display: flex;
  flex-wrap: wrap;
  gap: var(--ds-space-3);
  margin-top: var(--ds-space-6);
}

.store-link {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-2);
  min-height: 2.75rem;
  padding: 0 var(--ds-space-5);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-lg);
  background: var(--ds-color-neutral-0);
  color: var(--ds-color-neutral-900);
  font-size: var(--ds-text-base);
  font-weight: var(--ds-font-weight-medium);
  text-decoration: none;
  transition: border-color var(--ds-transition-base), box-shadow var(--ds-transition-base);
}

.store-link:hover {
  border-color: var(--accent-fill);
  box-shadow: var(--ds-elevation-2);
}

.mobile__availability {
  display: inline-flex;
  align-items: center;
  gap: var(--ds-space-2);
  margin-top: var(--ds-space-6);
  color: var(--ds-color-neutral-600);
}

.mobile__availability :deep(svg) {
  width: 1.35rem;
  height: 1.35rem;
  color: var(--accent-ink);
}

.mobile__device {
  align-self: end;
}

.phone {
  position: relative;
  width: 19rem;
  padding: 0.55rem;
  padding-bottom: 0;
  border: 1px solid var(--ds-color-neutral-700);
  border-bottom: 0;
  border-radius: 2.25rem 2.25rem 0 0;
  background: var(--ds-color-neutral-900);
  box-shadow: var(--ds-elevation-5);
}

.phone__notch {
  position: absolute;
  top: 0.9rem;
  left: 50%;
  width: 4rem;
  height: 0.35rem;
  transform: translateX(-50%);
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-neutral-700);
}

.phone__screen {
  overflow: hidden;
  aspect-ratio: 9 / 17;
  border-radius: 1.75rem 1.75rem 0 0;
  background: var(--ds-color-neutral-0);
}

.phone__screen img {
  display: block;
  width: 100%;
}

.phone__plate {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: var(--ds-space-2);
  height: 100%;
  padding: var(--ds-space-6);
  background: var(--accent-wash);
  text-align: center;
}

.phone__plate img {
  width: 3.25rem;
  height: 3.25rem;
}

.phone__plate strong {
  font-size: var(--ds-text-lg);
}

.phone__plate small {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.capabilities {
  padding: var(--ds-space-24) var(--ds-space-8);
  background: var(--ds-color-primary-900);
}

.capabilities__inner {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
  align-items: center;
  gap: var(--ds-space-16);
  max-width: var(--band-max);
  margin: 0 auto;
}

.capabilities .band-heading__label {
  color: var(--accent-on-dark);
}

.capabilities h2 {
  color: var(--ds-color-neutral-0);
}

.capabilities__lead {
  max-width: 34ch;
  margin-top: var(--ds-space-5);
  color: var(--ds-color-neutral-300);
  line-height: var(--ds-leading-relaxed);
}

.capability-list li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--ds-space-5);
  padding: var(--ds-space-6) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

.capability-list li:first-child {
  padding-top: 0;
  border-top: 0;
}

.capability__tile {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: var(--ds-radius-lg);
  background: rgba(255, 255, 255, 0.1);
  color: var(--accent-on-dark);
}

.capability__tile :deep(svg) {
  width: 1.5rem;
  height: 1.5rem;
}

.capability-list h3 {
  margin-bottom: var(--ds-space-2);
  color: var(--ds-color-neutral-0);
  font-size: var(--ds-text-lg);
}

.capability-list p {
  color: var(--ds-color-neutral-300);
  line-height: var(--ds-leading-relaxed);
}

.pricing {
  padding: var(--ds-space-24) var(--ds-space-8) var(--ds-space-16);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-4);
  max-width: var(--band-max);
  margin: 0 auto;
}

.plan {
  display: flex;
  flex-direction: column;
  padding: var(--ds-space-6);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-neutral-0);
}

.plan--featured {
  position: relative;
  border-color: transparent;
  background: var(--accent-wash);
  box-shadow: 0 0 0 2px var(--accent-fill), var(--ds-elevation-3);
}

.plan__badge {
  position: absolute;
  top: 0;
  left: var(--ds-space-6);
  padding: var(--ds-space-1) var(--ds-space-3);
  transform: translateY(-50%);
  border-radius: var(--ds-radius-full);
  background: var(--ds-color-primary-900);
  color: var(--ds-color-neutral-0);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  white-space: nowrap;
}

.plan__name {
  font-size: var(--ds-text-xl);
}

.plan__seats {
  margin-top: var(--ds-space-1);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.plan__price {
  display: flex;
  align-items: baseline;
  gap: var(--ds-space-2);
  margin: var(--ds-space-5) 0;
}

.plan__price strong {
  font-size: 2.5rem;
  line-height: 1;
  letter-spacing: -0.04em;
}

.plan__price span {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.plan__summary {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
  line-height: var(--ds-leading-relaxed);
}

.plan__features {
  display: grid;
  gap: var(--ds-space-2);
  margin: var(--ds-space-5) 0 var(--ds-space-6);
}

.plan__features li {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--ds-space-2);
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.plan__features :deep(svg) {
  width: 1.1rem;
  height: 1.1rem;
  margin-top: 0.1rem;
  color: var(--accent-ink);
}

.plan :deep(.ds-button) {
  margin-top: auto;
}

.addons {
  display: grid;
  gap: var(--ds-space-4);
  max-width: var(--band-max);
  margin: var(--ds-space-8) auto 0;
  padding: var(--ds-space-6);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-xl);
  background: var(--ds-color-neutral-0);
}

.addons__title {
  font-weight: var(--ds-font-weight-semibold);
}

.addons__list {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--ds-space-4);
}

.addons__list div {
  display: grid;
  gap: var(--ds-space-1);
  padding-left: var(--ds-space-4);
  border-left: 2px solid var(--accent-fill);
}

.addons__list dt {
  color: var(--ds-color-neutral-600);
  font-size: var(--ds-text-sm);
}

.addons__list dd {
  font-weight: var(--ds-font-weight-semibold);
}

.closing {
  padding: var(--ds-space-8) var(--ds-space-8) var(--ds-space-24);
}

/* Both gradient stops stay dark so white copy holds 4.5:1 across the sweep. */
.closing__card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-8);
  max-width: var(--band-max);
  margin: 0 auto;
  padding: var(--ds-space-12);
  border-radius: var(--ds-radius-2xl);
  background: linear-gradient(120deg, var(--ds-color-primary-900), var(--ds-color-secondary-900));
  color: var(--ds-color-neutral-0);
}

.closing__label {
  color: var(--ds-color-primary-100);
  font-size: var(--ds-text-xs);
  font-weight: var(--ds-font-weight-semibold);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.closing__card h2 {
  max-width: 22ch;
  margin-top: var(--ds-space-3);
  font-size: clamp(1.75rem, 3vw, 2.25rem);
  line-height: 1.14;
  letter-spacing: -0.025em;
}

.closing__lead {
  max-width: 44ch;
  margin-top: var(--ds-space-3);
  color: var(--ds-color-primary-100);
  line-height: var(--ds-leading-relaxed);
}

@media (max-width: 1080px) {
  .hero {
    grid-template-columns: minmax(0, 1fr);
    grid-template-areas: 'kicker' 'title' 'media' 'lead' 'actions' 'trust';
    gap: var(--ds-space-5);
    padding: var(--ds-space-12) var(--ds-space-6) var(--ds-space-16);
  }

  .hero__title,
  .hero__lead {
    max-width: none;
  }

  /* Stacked, the copy runs full width and the mark has no column of its own,
     so it crosses the headline at every size. */
  .hero::before {
    display: none;
  }

  .hero__media {
    justify-items: start;
    margin: var(--ds-space-3) 0;
  }

  .capabilities__inner {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--ds-space-10);
  }

  .capabilities__intro h2,
  .capabilities__lead {
    max-width: none;
  }

  .outcome-grid,
  .pricing-grid,
  .addons__list,
  .suite-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pricing-grid {
    gap: var(--ds-space-6) var(--ds-space-4);
  }

  .outcomes,
  .suite,
  .mobile,
  .capabilities,
  .pricing,
  .closing {
    padding-inline: var(--ds-space-6);
  }

  .mobile__inner {
    grid-template-columns: minmax(0, 1fr);
    justify-items: center;
    gap: var(--ds-space-10);
  }

  .mobile__copy {
    justify-self: start;
    padding-bottom: 0;
  }

  .mobile__copy h2,
  .mobile__lead {
    max-width: none;
  }
}

@media (max-width: 680px) {
  .hero {
    padding: var(--ds-space-10) var(--ds-space-5) var(--ds-space-12);
  }

  .hero__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero__actions :deep(.ds-button) {
    width: 100%;
  }

  .specimen {
    padding: var(--ds-space-6);
  }

  .specimen__value {
    font-size: clamp(0.875rem, 3.4vw, 1rem);
  }

  .band-heading h2,
  .capabilities__intro h2,
  .band-heading__lead {
    max-width: none;
  }

  .outcomes,
  .suite,
  .capabilities,
  .pricing {
    padding-block: var(--ds-space-16);
  }

  .mobile {
    padding-top: var(--ds-space-16);
  }

  .outcomes,
  .suite,
  .mobile,
  .capabilities,
  .pricing,
  .closing {
    padding-inline: var(--ds-space-5);
  }

  .phone {
    width: min(17rem, 100%);
  }

  .outcome-grid,
  .pricing-grid,
  .addons__list,
  .suite-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .outcome {
    padding: var(--ds-space-6);
  }

  .hero,
  .band-heading,
  .capabilities__intro,
  .mobile__copy,
  .closing__copy {
    text-align: center;
  }

  .hero__trust,
  .mobile__stores {
    justify-content: center;
  }

  .mobile__availability {
    display: flex;
    justify-content: center;
  }

  .hero__lead,
  .capabilities__lead,
  .mobile__lead {
    margin-inline: auto;
  }

  .closing {
    padding-bottom: var(--ds-space-16);
  }

  .closing__card {
    padding: var(--ds-space-8);
  }

  .closing__card :deep(.ds-button) {
    width: 100%;
  }
}
</style>
