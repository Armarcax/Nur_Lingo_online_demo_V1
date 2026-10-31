#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Ստուգված հարցաշարից (data/NUR_Lingo_civil_protection_reviewed.json)
կառուցում է src/lib/content/modules/civil-protection.json ֆայլը։

Օգտագործում (նախագծի արմատից)՝  python scripts/build-civil-protection.py
"""
import json, re, hashlib
from pathlib import Path
from datetime import date

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "NUR_Lingo_civil_protection_reviewed.json"
OUT = ROOT / "src" / "lib" / "content" / "modules" / "civil-protection.json"
OVERRIDES = ROOT / "data" / "distractor_overrides.json"  # {"162": [id, id, id]}
LESSON_SIZE = 10

# Թեմաների հերթականությունը (անվանումները՝ ինչպես ֆայլում)
TOPIC_ORDER = [
    ("Առաջին օգնություն և վնասվածքներ", "🩹", "#D90012"),
    ("Առաջին օգնություն", "⛑️", "#D90012"),
    ("Հոգեբանական առաջին օգնություն", "💬", "#a855f7"),
    ("Հրդեհային և պայթյունային անվտանգություն", "🔥", "#f97316"),
    ("Երկրաշարժեր և երկրաբանական վտանգներ", "🌍", "#0033A0"),
    ("Բնական աղետներ և եղանակային վտանգներ", "🌪️", "#60a5fa"),
    ("Քիմիական վտանգներ և թունավոր նյութեր", "🧪", "#22c55e"),
    ("Ճառագայթային և միջուկային վտանգներ", "☢️", "#a855f7"),
    ("Կենսաբանական վտանգներ և վարակներ", "🦠", "#06b6d4"),
    ("Ահաբեկչություն և կասկածելի առարկաներ", "🚨", "#ef4444"),
    ("Քաղաքացիական պաշտպանություն", "🛡️", "#D90012"),
    ("Քաղաքացիական պաշտպանություն, ազդարարում և տարհանում", "📢", "#F2A800"),
    ("Ընդհանուր անվտանգություն և ԱԻ", "⚠️", "#F2A800"),
    ("Հոգեբանական անվտանգություն և վարքագիծ", "🧠", "#a855f7"),
    ("Էկոլոգիական վտանգներ", "🌱", "#22c55e"),
]
BIO_HY = "Կենսաբանական վտանգներ և վարակներ"

NOTES = {  # ֆայլի source_note-ում նշված՝ ստուգման ենթակա կետը
    119: {
        "hy": "Իրավական հոդվածի ճշգրիտ հղումը ստուգման ենթակա է։",
        "en": "The exact legal article reference is pending verification.",
        "ru": "Точная ссылка на статью закона подлежит проверке.",
    }
}


def lesson_title(cat, k, i):
    if k == 1:
        return {l: cat[l] for l in ("hy", "en", "ru")}
    return {
        "hy": f"{cat['hy']} · {i} մաս",
        "en": f"{cat['en']} · Part {i}",
        "ru": f"{cat['ru']} · Часть {i}",
    }


def tokens(s):
    return set(w for w in re.findall(r"[\w԰-֏]+", s.lower()) if len(w) > 2)


def jaccard(a, b):
    return len(a & b) / len(a | b) if a and b else 0.0


def noise(a, b):
    h = hashlib.md5(f"{a}:{b}".encode()).hexdigest()
    return int(h[:6], 16) / 0xFFFFFF  # 0..1, կայուն


def main():
    raw = json.loads(SRC.read_text(encoding="utf-8"))
    qs = raw["questions"]

    # 1) «Սխալ դասակարգված» հարցը տեղափոխվում է իր թեմա՝ ըստ բովանդակության
    moved = []
    bio_cat = next(x["category"] for x in qs if x["category"]["hy"] == BIO_HY)
    for q in qs:
        if q["category"]["en"].startswith("Misclassified"):
            moved.append(q["id"])
            q["category"] = bio_cat

    by_hy = {}
    for q in qs:
        by_hy.setdefault(q["category"]["hy"], []).append(q)
    missing = set(by_hy) - {t[0] for t in TOPIC_ORDER}
    assert not missing, f"Անհայտ թեմաներ՝ {missing}"

    overrides = json.loads(OVERRIDES.read_text(encoding="utf-8")) if OVERRIDES.exists() else {}
    topics, questions, qtopic = [], {}, {}
    for ti, (hy_name, icon, color) in enumerate(TOPIC_ORDER, start=1):
        items = sorted(by_hy[hy_name], key=lambda x: x["id"])
        cat = items[0]["category"]
        n = len(items)
        k = max(1, -(-n // LESSON_SIZE))
        base, rem = divmod(n, k)
        lessons, pos = [], 0
        for li in range(k):
            size = base + (1 if li < rem else 0)
            chunk = items[pos:pos + size]
            pos += size
            lessons.append({
                "id": f"cp_{ti:02d}_{li + 1}",
                "title": lesson_title(cat, k, li + 1),
                "questionIds": [c["id"] for c in chunk],
            })
        tid = f"cp_t{ti:02d}"
        topics.append({"id": tid, "icon": icon, "color": color, "title": cat,
                       "questionCount": n, "lessons": lessons})
        for it in items:
            qtopic[it["id"]] = tid

    # 2) Շեղող տարբերակներ՝ նույն հարցաշարի այլ հարցերի պատասխաններից
    info = {q["id"]: {"a": q["answer_source"]["hy"],
                      "ta": tokens(q["answer_source"]["hy"]),
                      "tq": tokens(q["question"]["hy"])} for q in qs}
    for q in qs:
        qid = q["id"]
        me = info[qid]
        la = len(me["a"])
        dig = bool(re.search(r"\d", me["a"]))
        scored = []
        for o in qs:
            if o["id"] == qid:
                continue
            ot = info[o["id"]]
            if ot["a"] == me["a"]:
                continue
            if jaccard(me["ta"], ot["ta"]) > 0.35 or jaccard(me["tq"], ot["tq"]) > 0.6:
                continue
            lo = len(ot["a"])
            s = 4 * (1 - min(1, abs(la - lo) / max(la, lo)))
            s += 6 if qtopic[o["id"]] == qtopic[qid] else 0
            s += 2 if dig == bool(re.search(r"\d", ot["a"])) else -2
            s += 0.8 * noise(qid, o["id"])
            scored.append((s, o["id"], ot["a"]))
        scored.sort(reverse=True)
        picked, seen = [], set()
        for s, oid, text in scored:
            if text in seen:
                continue
            seen.add(text)
            picked.append(oid)
            if len(picked) == 3:
                break
        if str(qid) in overrides:
            picked = [int(x) for x in overrides[str(qid)]][:3]
        entry = {
            "id": qid, "topicId": qtopic[qid],
            "question": q["question"], "answer": q["answer_source"],
            "status": q["review_status"], "sources": q["sources"],
            "distractors": picked,
        }
        if qid in NOTES:
            entry["note"] = NOTES[qid]
        questions[str(qid)] = entry

    out = {
        "version": "1.0", "generatedAt": str(date.today()),
        "title": raw["title"], "sourceNote": raw["source_note"],
        "stats": {"questions": len(qs), "topics": len(topics),
                  "lessons": sum(len(t["lessons"]) for t in topics)},
        "relocated": moved, "topics": topics, "questions": questions,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"OK {out['stats']} relocated={moved} -> {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
