import type { TrackCertificate } from "@/lib/certificates/types";
import {
  buildTrackInfoLine,
  formatCertificateDay,
  formatCertificateYear,
} from "@/lib/certificates/format";

type Props = {
  certificate: TrackCertificate;
  /** Play entrance motion (completion moment). */
  animate?: boolean;
  className?: string;
};

export function TrackCertificate({
  certificate,
  animate = false,
  className = "",
}: Props) {
  const trackInfo = buildTrackInfoLine(
    certificate.lessonCount,
    certificate.studyMinutes,
  );

  return (
    <article
      className={`track-cert${animate ? " track-cert--animate" : ""}${className ? ` ${className}` : ""}`}
      aria-label={`Certificate of completion for ${certificate.topic}`}
      data-testid="track-certificate"
    >
      <div className="track-cert-glyph" aria-hidden>
        §
      </div>
      <div className="track-cert-inner">
        <div className="track-cert-wordmark">
          Cu<em>ri</em>
        </div>
        <div className="track-cert-wordmark-rule" aria-hidden />

        <p className="track-cert-label">This certifies that</p>
        <p className="track-cert-name">{certificate.recipientName}</p>

        <div className="track-cert-divider" aria-hidden />

        <p className="track-cert-label">
          Has completed a {certificate.lessonCount}-lesson track in
        </p>
        <h3 className="track-cert-subject">{certificate.topic}</h3>
        <div className="track-cert-accent-rule" aria-hidden />

        <p className="track-cert-track-info">{trackInfo}</p>

        <div className="track-cert-bottom">
          <div className="track-cert-bottom-item">
            <span className="track-cert-bottom-label">Completed</span>
            <span className="track-cert-bottom-value">
              {formatCertificateDay(certificate.completedAt)}
            </span>
            <span className="track-cert-bottom-sub">
              {formatCertificateYear(certificate.completedAt)}
            </span>
          </div>
          <div className="track-cert-bottom-item">
            <span className="track-cert-bottom-label">Streak at completion</span>
            <span className="track-cert-bottom-value">
              {certificate.streakAtCompletion} days
            </span>
            <span className="track-cert-bottom-sub">unbroken</span>
          </div>
          <div className="track-cert-bottom-item">
            <span className="track-cert-bottom-label">Certificate ID</span>
            <span className="track-cert-bottom-id">
              {certificate.certificateId}
            </span>
            <span className="track-cert-bottom-sub">curi.one/verify</span>
          </div>
        </div>
      </div>
    </article>
  );
}
