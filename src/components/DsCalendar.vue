<script setup lang="ts" generic="E extends CalendarEvent">
import { computed, nextTick, ref, watch } from 'vue'
import DsIconButton from './DsIconButton.vue'
import { areaStyle } from '../areas'
import {
  dateKey,
  monthGrid,
  monthKey,
  monthRange,
  shiftMonth,
  weekdayLabels,
  type CalendarDay,
  type CalendarEvent,
} from '../calendar'

const props = withDefaults(
  defineProps<{
    events?: E[]
    weekStartsOn?: 0 | 1
    /** Events shown in a day before the rest collapse into "+N more". */
    maxEvents?: number
    locale?: string
    loading?: boolean
    label?: string
    todayLabel?: string
  }>(),
  { events: () => [], weekStartsOn: 0, maxEvents: 3, locale: undefined, loading: false, label: 'Calendar', todayLabel: 'Today' },
)

const month = defineModel<string>('month', { default: () => monthKey(new Date()) })
const selected = defineModel<string | null>('selected', { default: null })

const emit = defineEmits<{
  range: [range: { from: Date; to: Date }]
  'select-day': [day: CalendarDay<E>]
  'open-event': [event: E]
}>()

defineSlots<{
  'toolbar-end'?: () => unknown
  empty?: () => unknown
  event?: (scope: { event: E }) => unknown
}>()

const days = computed(() => monthGrid(month.value, props.events, { weekStartsOn: props.weekStartsOn }))
const weekdays = computed(() => weekdayLabels(props.weekStartsOn, props.locale))
const title = computed(() => {
  const [year, index] = month.value.split('-').map(Number)
  return new Date(year!, index! - 1, 1).toLocaleDateString(props.locale, { month: 'long', year: 'numeric' })
})
const monthIsEmpty = computed(() => days.value.every((day) => !day.inMonth || day.events.length === 0))
const focusKey = ref(selected.value ?? dateKey(new Date()))
const grid = ref<HTMLElement | null>(null)

const dayLabel = (day: CalendarDay<E>) => {
  const date = day.date.toLocaleDateString(props.locale, { weekday: 'long', month: 'long', day: 'numeric' })
  return day.events.length ? `${date}, ${day.events.length} ${day.events.length === 1 ? 'item' : 'items'}` : date
}
const rows = computed(() => Array.from({ length: 6 }, (_, week) => days.value.slice(week * 7, week * 7 + 7)))
const tabKey = computed(() =>
  days.value.some((d) => d.key === focusKey.value && d.inMonth)
    ? focusKey.value
    : (days.value.find((d) => d.today && d.inMonth) ?? days.value.find((d) => d.inMonth))!.key,
)

watch(
  [month, () => props.weekStartsOn],
  () => emit('range', monthRange(month.value, props.weekStartsOn)),
  { immediate: true },
)

function go(by: number) {
  month.value = shiftMonth(month.value, by)
}

function goToday() {
  const today = new Date()
  month.value = monthKey(today)
  focusKey.value = dateKey(today)
}

function select(day: CalendarDay<E>) {
  focusKey.value = day.key
  if (!day.inMonth) month.value = monthKey(day.date)
  selected.value = day.key
  emit('select-day', day)
}

const steps: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }

async function onKeydown(event: KeyboardEvent, day: CalendarDay<E>) {
  const step = steps[event.key]
  if (step === undefined) return
  event.preventDefault()
  const target = new Date(day.date.getFullYear(), day.date.getMonth(), day.date.getDate() + step)
  focusKey.value = dateKey(target)
  if (monthKey(target) !== month.value) month.value = monthKey(target)
  await nextTick()
  grid.value?.querySelector<HTMLElement>(`[data-day="${focusKey.value}"]`)?.focus()
}

const toneOf = (event: E) => (event.area ? 'area' : (event.tone ?? 'neutral'))
</script>

<template>
  <section class="ds-calendar" :aria-label="label" :aria-busy="loading || undefined">
    <header class="ds-calendar__toolbar">
      <button type="button" class="ds-calendar__today" @click="goToday">{{ todayLabel }}</button>
      <DsIconButton variant="ghost" size="sm" icon="solar:alt-arrow-left-linear" title="Previous month" @click="go(-1)" />
      <DsIconButton variant="ghost" size="sm" icon="solar:alt-arrow-right-linear" title="Next month" @click="go(1)" />
      <h2 class="ds-calendar__title" aria-live="polite">{{ title }}</h2>
      <div class="ds-calendar__toolbar-end"><slot name="toolbar-end" /></div>
    </header>

    <div v-if="monthIsEmpty && !loading && $slots.empty" class="ds-calendar__empty"><slot name="empty" /></div>

    <div ref="grid" class="ds-calendar__grid" role="grid" :aria-label="title">
      <div class="ds-calendar__row ds-calendar__weekdays" role="row">
        <div v-for="name in weekdays" :key="name" class="ds-calendar__weekday" role="columnheader">{{ name }}</div>
      </div>
      <div v-for="(week, w) in rows" :key="w" class="ds-calendar__row" role="row">
        <div
          v-for="day in week"
          :key="day.key"
          class="ds-calendar__day"
          :class="{
            'ds-calendar__day--outside': !day.inMonth,
            'ds-calendar__day--today': day.today,
            'ds-calendar__day--selected': day.key === selected,
          }"
          role="gridcell"
          :aria-selected="day.key === selected"
          @click.self="select(day)"
        >
          <button
            type="button"
            class="ds-calendar__number"
            :data-day="day.key"
            :tabindex="day.key === tabKey ? 0 : -1"
            :aria-label="dayLabel(day)"
            :aria-current="day.today ? 'date' : undefined"
            @click="select(day)"
            @keydown="onKeydown($event, day)"
          >
            {{ day.day }}
          </button>
          <ul v-if="day.events.length" class="ds-calendar__events">
            <li v-for="event in day.events.slice(0, maxEvents)" :key="event.id">
              <button
                type="button"
                class="ds-calendar__event"
                :class="`ds-calendar__event--${toneOf(event)}`"
                :style="areaStyle(event.area)"
                tabindex="-1"
                @click="emit('open-event', event)"
              >
                <slot name="event" :event="event">{{ event.title }}</slot>
              </button>
            </li>
            <li v-if="day.events.length > maxEvents">
              <button type="button" class="ds-calendar__more" tabindex="-1" @click="select(day)">
                +{{ day.events.length - maxEvents }} more
              </button>
            </li>
          </ul>
          <span v-if="day.events.length" class="ds-calendar__dots" aria-hidden="true">
            <span
              v-for="event in day.events.slice(0, 3)"
              :key="event.id"
              class="ds-calendar__dot"
              :class="`ds-calendar__event--${toneOf(event)}`"
              :style="areaStyle(event.area)"
            />
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Sized by the space it is given, not the viewport: the same calendar sits in a page, a panel or a phone. */
.ds-calendar {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  background: var(--ds-bg-surface);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-card);
  overflow: hidden;
}

.ds-calendar__toolbar {
  display: flex;
  align-items: center;
  gap: var(--ds-space-1);
  padding: var(--ds-space-2) var(--ds-space-3);
  border-bottom: 1px solid var(--ds-border-base);
}

.ds-calendar__today {
  height: 2rem;
  padding: 0 var(--ds-space-3);
  margin-right: var(--ds-space-1);
  border: 1px solid var(--ds-border-base);
  border-radius: var(--ds-radius-control);
  background: var(--ds-bg-surface);
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-weight: 500;
  cursor: pointer;
}

.ds-calendar__today:hover {
  background: var(--ds-bg-hover);
}

.ds-calendar__title {
  margin: 0 0 0 var(--ds-space-2);
  font-size: var(--ds-text-base);
  font-weight: 600;
  color: var(--ds-text-primary);
  white-space: nowrap;
}

.ds-calendar__toolbar-end {
  display: flex;
  align-items: center;
  gap: var(--ds-space-2);
  margin-left: auto;
}

.ds-calendar__empty {
  padding: var(--ds-space-2) var(--ds-space-3);
  border-bottom: 1px solid var(--ds-border-base);
  background: var(--ds-bg-subtle);
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}

.ds-calendar__row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.ds-calendar__weekday {
  padding: var(--ds-space-2);
  color: var(--ds-text-muted);
  font-size: var(--ds-text-xs);
  font-weight: 500;
  text-align: left;
  border-bottom: 1px solid var(--ds-border-base);
}

.ds-calendar__day {
  position: relative;
  min-height: 6.5rem;
  padding: var(--ds-space-1);
  border-right: 1px solid var(--ds-border-base);
  border-bottom: 1px solid var(--ds-border-base);
  cursor: pointer;
  min-width: 0;
}

.ds-calendar__day:nth-child(7n) {
  border-right: 0;
}

.ds-calendar__row:last-child .ds-calendar__day {
  border-bottom: 0;
}

.ds-calendar__day--outside {
  background: var(--ds-bg-subtle);
}

.ds-calendar__day--outside .ds-calendar__number {
  color: var(--ds-text-muted);
}

.ds-calendar__day--selected {
  background: var(--ds-accent-fill);
}

.ds-calendar__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  height: 1.75rem;
  padding: 0 var(--ds-space-1);
  border: 0;
  border-radius: var(--ds-radius-full);
  background: none;
  color: var(--ds-text-primary);
  font: inherit;
  font-size: var(--ds-text-sm);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
}

.ds-calendar__number:hover {
  background: var(--ds-bg-hover);
}

.ds-calendar__number:focus-visible {
  outline: 2px solid var(--ds-border-focus);
  outline-offset: 1px;
}

.ds-calendar__day--today .ds-calendar__number {
  background: var(--ds-interactive-primary);
  color: var(--ds-on-interactive-primary);
  font-weight: 600;
}

.ds-calendar__events {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: var(--ds-space-1) 0 0;
  padding: 0;
  list-style: none;
}

.ds-calendar__event,
.ds-calendar__more {
  display: block;
  width: 100%;
  padding: 1px var(--ds-space-1);
  border: 0;
  border-radius: var(--ds-radius-sm);
  font: inherit;
  font-size: var(--ds-text-xs);
  line-height: 1.35;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

/* Tints come from the solid tone mixed with the surface and text colours, so they follow the theme. */
.ds-calendar__event {
  border-left: 3px solid var(--tone-solid);
  background: var(--tone-fill, color-mix(in oklab, var(--tone-solid) 16%, var(--ds-bg-surface)));
  color: var(--tone-ink, color-mix(in oklab, var(--tone-solid) 55%, var(--ds-text-primary)));
}

.ds-calendar__more {
  background: none;
  color: var(--ds-text-secondary);
  font-weight: 500;
}

.ds-calendar__more:hover {
  color: var(--ds-text-primary);
}

.ds-calendar__event--neutral {
  --tone-fill: var(--ds-bg-muted);
  --tone-ink: var(--ds-text-secondary);
  --tone-solid: var(--ds-border-strong);
}

.ds-calendar__event--info {
  --tone-solid: var(--ds-color-info-500);
}

.ds-calendar__event--success {
  --tone-solid: var(--ds-color-success-500);
}

.ds-calendar__event--warning {
  --tone-solid: var(--ds-color-warning-500);
}

.ds-calendar__event--danger {
  --tone-solid: var(--ds-color-error-500);
}

.ds-calendar__event--area {
  --tone-fill: var(--ds-area-fill);
  --tone-ink: var(--ds-area-ink);
  --tone-solid: var(--ds-area-solid);
}

.ds-calendar__dots {
  display: none;
}

.ds-calendar__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--ds-radius-full);
  background: var(--tone-solid);
}

/* Too narrow for titles: each day keeps its number and shows a dot per item instead. */
@container (max-width: 559px) {
  .ds-calendar__title {
    font-size: var(--ds-text-sm);
  }

  .ds-calendar__weekday {
    padding: var(--ds-space-1) 0;
    text-align: center;
  }

  .ds-calendar__day {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 3.25rem;
    padding: var(--ds-space-1) 0;
  }

  .ds-calendar__events {
    display: none;
  }

  .ds-calendar__dots {
    display: flex;
    gap: 3px;
    margin-top: 2px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .ds-calendar__number,
  .ds-calendar__today {
    transition: background-color 0.15s ease;
  }
}
</style>
