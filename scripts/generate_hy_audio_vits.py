import os
import json
import torch
import soundfile as sf
from pydub import AudioSegment
import sys

# VITS-ի ստանդարտ իմպորտներ (ենթադրվում է, որ սկրիպտը գտնվում է VITS ռեպոյի արմատում)
import utils
from models import SynthesizerTrn
from text import text_to_sequence

def load_model(config_path, checkpoint_path, device):
    """Բեռնում է VITS մոդելը"""
    hps = utils.get_hparams_from_file(config_path)
    net_g = SynthesizerTrn(
        len(hps.symbols),
        hps.data.filter_length // 2 + 1,
        hps.train.segment_size // hps.data.hop_length,
        n_speakers=hps.data.n_speakers,
        **hps.model).to(device)
    _ = net_g.eval()
    _ = utils.load_checkpoint(checkpoint_path, net_g, None)
    return net_g, hps

def synthesize(net_g, hps, text, speaker_id, device):
    """Գեներացնում է ձայնը տեքստից"""
    # Տեքստի մաքրում և վերածում հաջորդականության (սա կախված է մոդելից, 
    # եթե մոդելը պահանջում է ֆոնեմներ, օգտագործեք մոդիֆիկացված text_cleaners-ը)
    stn_tst = text_to_sequence(text, hps.data.text_cleaners, add_blank=hps.data.add_blank)
    stn_tst = torch.LongTensor(stn_tst).to(device)
    
    with torch.no_grad():
        x_tst = stn_tst.unsqueeze(0)
        x_tst_lengths = torch.LongTensor([stn_tst.size(0)]).to(device)
        sid = torch.LongTensor([speaker_id]).to(device)
        audio = net_g.infer(x_tst, x_tst_lengths, sid=sid, noise_scale=.667, 
                            noise_scale_w=0.8, length_scale=1)[0, 0].data.cpu().float().numpy()
    return audio, hps.data.sampling_rate

def main():
    # ─── ՈՒՂԻՆԵՐԻ ԿԱՐԳԱՎՈՐՈՒՄ (Խնդրում եմ ստուգել և ուղղել ըստ ձեր պանակների) ───
    VITS_CONFIG = "configs/your_armenian_config.json"       # Փոխարինեք ձեր .json ֆայլի անունով
    VITS_CHECKPOINT = "checkpoints/your_armenian_model.pth" # Փոխարինեք ձեր .pth ֆայլի անունով
    
    # NUR Lingo-ի բառարանի և ելքի պանակի ուղիները (հարաբերական VITS ռեպոյի նկատմամբ)
    NUR_LINGO_DICT = "../data/dictionaries/unified-dictionary.json"
    OUT_DIR = "../public/audio/hy"
    
    SPEAKER_ID = 0 # Սովորաբար 0 է մեկ խոսողի մոդելների համար
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"🚀 Օգտագործվող սարքը: {device}")
    
    if not os.path.exists(VITS_CONFIG) or not os.path.exists(VITS_CHECKPOINT):
        print(f"❌ Սխալ: Չգտնվեց կոնֆիգուրացիան կամ մոդելի ֆայլը:")
        print(f"   Config: {VITS_CONFIG}")
        print(f"   Checkpoint: {VITS_CHECKPOINT}")
        sys.exit(1)

    print("⏳ Բեռնվում է VITS մոդելը...")
    net_g, hps = load_model(VITS_CONFIG, VITS_CHECKPOINT, device)
    print("✅ Մոդելը հաջողությամբ բեռնված է:")
    
    # Բեռնել NUR Lingo-ի բառարանը
    if not os.path.exists(NUR_LINGO_DICT):
        print(f"❌ Չի գտնվել բառարանը: {NUR_LINGO_DICT}")
        sys.exit(1)
        
    with open(NUR_LINGO_DICT, 'r', encoding='utf-8') as f:
        entries = json.load(f)
        
    os.makedirs(OUT_DIR, exist_ok=True)
    
    success_count = 0
    skip_count = 0
    fail_count = 0
    
    print(f"📚 Գտնվել է {len(entries)} բառ: Սկսում ենք գեներացիան...\n")
    
    for i, entry in enumerate(entries):
        # Մաքրում ենք բանալիների և արժեքների վերջում եղած ավելորդ բացատները
        entry_id = entry.get("id", "").strip() or f"{i+1:06d}"
        hy_text = entry.get("hy", "").strip()
        
        if not hy_text:
            continue
            
        out_wav = os.path.join(OUT_DIR, f"{entry_id}.wav")
        out_mp3 = os.path.join(OUT_DIR, f"{entry_id}.mp3")
        
        # Եթե ֆայլը արդեն կա և նորմալ չափսի է, բաց ենք թողնում
        if os.path.exists(out_mp3) and os.path.getsize(out_mp3) > 1000:
            skip_count += 1
            continue
            
        try:
            # Գեներացնել ձայնը
            audio, sr = synthesize(net_g, hps, hy_text, SPEAKER_ID, device)
            
            # Պահպանել որպես WAV
            sf.write(out_wav, audio, sr)
            
            # Վերածել WAV-ը MP3-ի (պահանջվում է pydub և ffmpeg)
            sound = AudioSegment.from_wav(out_wav)
            sound.export(out_mp3, format="mp3", bitrate="128k")
            os.remove(out_wav) # Ջնջել ժամանակավոր WAV ֆայլը
            
            success_count += 1
            if success_count % 50 == 0:
                print(f"   ✅ Առաջընթաց: {success_count} ֆայլ գեներացված է...")
                
        except Exception as e:
            print(f"   ❌ Սխալ {entry_id} ({hy_text}) համար: {e}")
            fail_count += 1
            if os.path.exists(out_wav): os.remove(out_wav)
            
    print(f"\n🏁 ԱՎԱՐՏՎԱԾ Է:")
    print(f"   ✅ Հաջող: {success_count}")
    print(f"   ⏭️ Բաց թողնված: {skip_count}")
    print(f"   ❌ Սխալ: {fail_count}")

if __name__ == "__main__":
    main()