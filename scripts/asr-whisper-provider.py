#!/usr/bin/env python3
import argparse
import json
import sys


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description="Transcribe audio for InkOS RIS transcript provider.")
    parser.add_argument("--language", default="zh", help="Language hint, for example zh")
    parser.add_argument("--model", default="small", help="faster-whisper model size or path")
    parser.add_argument("--device", default="auto", help="faster-whisper device")
    parser.add_argument("--compute-type", default="default", help="faster-whisper compute type")
    parser.add_argument("audio", help="Audio file path")
    args = parser.parse_args()

    try:
        from faster_whisper import WhisperModel
    except Exception as exc:
        print(json.dumps({"text": "", "language": args.language, "error": f"faster-whisper unavailable: {exc}"}, ensure_ascii=False))
        return 2

    model = WhisperModel(args.model, device=args.device, compute_type=args.compute_type)
    segments, info = model.transcribe(args.audio, language=args.language, vad_filter=True)
    text = "\n".join(segment.text.strip() for segment in segments if segment.text.strip())
    print(json.dumps({"text": text, "language": info.language or args.language}, ensure_ascii=False))
    return 0 if text else 1


if __name__ == "__main__":
    sys.exit(main())
