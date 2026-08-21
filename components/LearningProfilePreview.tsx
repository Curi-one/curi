"use client";

import { useMemo, useState } from "react";
import type { LearningProfile } from "@/lib/profile/learning-profile";
import { learningProfileStance } from "@/lib/profile/learning-profile";
import {
  LENGTH_CAPTION,
  PREVIEW_TOPIC_KEYS,
  PREVIEW_TOPICS,
  renderPreviewLesson,
  type PreviewTopicKey,
} from "@/lib/profile/preview-samples";

type LearningProfilePreviewProps = {
  profile: LearningProfile;
};

export function LearningProfilePreview({
  profile,
}: LearningProfilePreviewProps) {
  const [topicKey, setTopicKey] = useState<PreviewTopicKey>("fundraising");
  const [swapping, setSwapping] = useState(false);

  const lesson = useMemo(
    () => renderPreviewLesson(topicKey, profile),
    [topicKey, profile],
  );

  function selectTopic(key: PreviewTopicKey) {
    if (key === topicKey) return;
    setSwapping(true);
    window.setTimeout(() => {
      setTopicKey(key);
      setSwapping(false);
    }, 110);
  }

  const stance = learningProfileStance(profile);

  return (
    <div className="lg:sticky lg:top-7">
      <div className="mb-4 flex items-center gap-2.5 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
        <span>Curi</span>
        <span className="font-display italic text-ink">×</span>
        <span>You</span>
      </div>

      <p className="mb-5 text-base leading-snug text-ink">{stance}</p>

      <div className="mb-3.5 flex flex-wrap gap-2">
        {PREVIEW_TOPIC_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => selectTopic(key)}
            className={`min-h-9 border px-3 py-2 font-meta text-ui-4xs uppercase tracking-wider transition-colors ${
              topicKey === key
                ? "border-transparent bg-accent text-paper"
                : "border-border-strong text-ink-muted hover:border-ink hover:text-ink"
            }`}
          >
            {PREVIEW_TOPICS[key].label}
          </button>
        ))}
      </div>
      <p className="mb-4 font-meta text-xs tracking-wide text-ink-faint">
        Same settings. Three unrelated courses.
      </p>

      <article className="border border-ink bg-paper">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5 font-meta text-ui-3xs uppercase tracking-wider text-ink-muted">
          <span>Sample lesson</span>
          <span>{LENGTH_CAPTION[profile.length]}</span>
        </div>
        <div
          className={`px-5 py-6 transition-opacity duration-150 ${swapping ? "opacity-0" : "opacity-100"}`}
        >
          <p className="mb-2 font-meta text-ui-3xs uppercase tracking-widest text-ink-faint">
            {lesson.tag}
          </p>
          <h3 className="mb-4 font-display text-xl font-medium leading-tight tracking-tight text-ink">
            {lesson.title}
          </h3>

          {lesson.gloss ? (
            <p
              className={
                lesson.glossInline
                  ? "mb-3.5 text-xs italic text-ink-muted"
                  : "mb-4 border-l-2 border-border-strong pl-3 text-sm italic text-ink-muted"
              }
            >
              {lesson.gloss}
            </p>
          ) : null}

          <p className="mb-3 text-sm leading-relaxed text-ink">{lesson.p1}</p>
          {lesson.p2 ? (
            <p className="mb-3 text-sm leading-relaxed text-ink">{lesson.p2}</p>
          ) : null}
          {lesson.p3 ? (
            <p className="mb-3 text-sm leading-relaxed text-ink">{lesson.p3}</p>
          ) : null}

          {lesson.extraTag && lesson.extraText ? (
            <div className="mt-4 border-t border-border pt-3.5">
              <p className="mb-1.5 font-meta text-ui-4xs uppercase tracking-widest text-ink-faint">
                {lesson.extraTag}
              </p>
              <p className="text-sm leading-relaxed text-ink">
                {lesson.extraText}
              </p>
            </div>
          ) : null}
        </div>
      </article>

      <p className="mt-3.5 text-right font-meta text-xs tracking-wide text-ink-faint">
        Drawn live from your settings
      </p>
    </div>
  );
}
