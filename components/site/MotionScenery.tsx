import type { CSSProperties } from "react";

export function MotionScenery() {
  return <div className="motion-scenery" aria-hidden="true">
    <div className="motion-aurora"><i /><i /><i /></div>
    <div className="motion-perspective-grid" />
    <div className="motion-satellite"><span /><span /><span /></div>
    <div className="motion-stars">{Array.from({ length: 16 }, (_, index) => <i key={index} style={{
      "--star-x": `${(index * 37 + 13) % 100}%`,
      "--star-y": `${(index * 23 + 7) % 85}%`,
      "--star-delay": `${index * -.45}s`,
    } as CSSProperties} />)}</div>
  </div>;
}

export function MotionRibbon() {
  return <div className="motion-ribbon-shell" aria-hidden="true"><div className="motion-ribbon">
    <div className="motion-ribbon-track">{[0, 1].map(copy => <div className="motion-ribbon-copy" key={copy}>
      <span>让界面有引力</span><i>✳</i><span className="ribbon-outline">MAKE IT MOVE</span><i>↗</i><span>交互正在发生</span><i>✳</i>
    </div>)}</div>
  </div></div>;
}
