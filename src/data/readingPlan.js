import { ALL_BOOKS } from "./constants.js";
import { CHRONOLOGICAL_BOOK_ORDER } from "./chronologicalOrder.js";

export const TOTAL_READING_DAYS = 365;

export const PLAN_TYPES = [
  { id: "canonico", label: "Ordem da Bíblia", desc: "Gênesis ao Apocalipse, na ordem tradicional." },
  { id: "cronologico", label: "Ordem Cronológica", desc: "Os livros na ordem em que os eventos aconteceram." },
];

const CHAPTER_COUNT_BY_BOOK = Object.fromEntries(ALL_BOOKS);

function buildChapterList(bookOrder) {
  const chapters = [];
  for (const book of bookOrder) {
    const count = CHAPTER_COUNT_BY_BOOK[book];
    for (let c = 1; c <= count; c++) chapters.push({ book, chapter: c });
  }
  return chapters;
}

const CHAPTERS_BY_PLAN = {
  canonico: buildChapterList(ALL_BOOKS.map(([book]) => book)),
  cronologico: buildChapterList(CHRONOLOGICAL_BOOK_ORDER),
};

export const TOTAL_CHAPTERS = CHAPTERS_BY_PLAN.canonico.length;

// Divide a Biblia inteira em N dias, na ordem escolhida (canonica ou cronologica).
export function getDayReading(day, planType = "canonico") {
  const chapters = CHAPTERS_BY_PLAN[planType] || CHAPTERS_BY_PLAN.canonico;
  const total = chapters.length;
  const start = Math.round((day - 1) * total / TOTAL_READING_DAYS);
  const end = Math.round(day * total / TOTAL_READING_DAYS);
  return chapters.slice(start, end);
}

export function chaptersReadThrough(day, planType = "canonico") {
  const chapters = CHAPTERS_BY_PLAN[planType] || CHAPTERS_BY_PLAN.canonico;
  const total = chapters.length;
  return Math.round(Math.min(day, TOTAL_READING_DAYS) * total / TOTAL_READING_DAYS);
}

// Agrupa capitulos consecutivos do mesmo livro num rotulo curto, ex: "Salmos 42-44".
export function formatReadingLabel(readings) {
  if (!readings.length) return "";
  const groups = [];
  for (const r of readings) {
    const last = groups[groups.length - 1];
    if (last && last.book === r.book && r.chapter === last.to + 1) {
      last.to = r.chapter;
    } else {
      groups.push({ book: r.book, from: r.chapter, to: r.chapter });
    }
  }
  return groups
    .map(g => (g.from === g.to ? `${g.book} ${g.from}` : `${g.book} ${g.from}–${g.to}`))
    .join(" · ");
}
