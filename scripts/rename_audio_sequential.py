#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
📁 Rename Audio Files Sequentially
==================================
Վերանվանում է en/ և ru/ պանակների MP3 ֆայլերը հաջորդական համարակալմամբ՝
առանց բացթողումների (000001, 000002, ...):

Օգտագործում:
    python rename_audio_sequential.py
"""

import os
import shutil
from pathlib import Path

# ─── Կարգավորումներ ────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.absolute()  # Եթե սկրիպտը գտնվում է արմատում
# Եթե սկրիպտը scripts/-ում է, ապա.
# PROJECT_ROOT = Path(__file__).parent.parent

AUDIO_BASE = PROJECT_ROOT / "public" / "audio"
FOLDERS = ["en", "ru"]

def rename_sequential(folder_path):
    """Վերանվանում է բոլոր MP3-ները տվյալ պանակում հաջորդական համարներով"""
    folder = Path(folder_path)
    if not folder.exists():
        print(f"⚠️ Պանակը գոյություն չունի՝ {folder}")
        return

    # Հավաքել բոլոր MP3 ֆայլերը, որոնց անունը թվային է (օր. 000001.mp3)
    mp3_files = []
    for f in folder.glob("*.mp3"):
        stem = f.stem  # առանց .mp3
        if stem.isdigit():
            mp3_files.append((int(stem), f))
        else:
            print(f"⚠️ Բաց թողնված ֆայլ (ոչ թվային անուն)՝ {f.name}")

    if not mp3_files:
        print(f"ℹ️ {folder.name} պանակում MP3 ֆայլեր չեն գտնվել:")
        return

    # Դասավորել ըստ թվային արժեքի
    mp3_files.sort(key=lambda x: x[0])

    print(f"\n📁 {folder.name}/ - հայտնաբերվել է {len(mp3_files)} ֆայլ:")
    for num, f in mp3_files:
        print(f"   {f.name}")

    # Վերանվանել
    renamed_count = 0
    for new_index, (old_num, old_path) in enumerate(mp3_files, start=1):
        new_name = f"{new_index:06d}.mp3"
        new_path = folder / new_name

        if old_path == new_path:
            # Ֆայլն արդեն ճիշտ անուն ունի
            continue

        # Վերանվանել
        old_path.rename(new_path)
        print(f"   ✅ {old_path.name} → {new_name}")
        renamed_count += 1

    print(f"   ✅ {folder.name}/ վերանվանվել է {renamed_count} ֆայլ")

def main():
    print("🔄 Սկսում ենք աուդիո ֆայլերի հաջորդական վերանվանումը...")
    print("=" * 50)

    for folder_name in FOLDERS:
        folder_path = AUDIO_BASE / folder_name
        rename_sequential(folder_path)

    print("\n✅ Ամեն ինչ պատրաստ է: Բոլոր ֆայլերն այժմ համարակալված են առանց բացերի:")
    print("   public/audio/en/000001.mp3, 000002.mp3, ...")
    print("   public/audio/ru/000001.mp3, 000002.mp3, ...")
    print("   (manifest.json-ը մնում է անփոփոխ)")

if __name__ == "__main__":
    main()