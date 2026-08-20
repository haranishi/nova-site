"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useState, type ReactNode } from "react";
import { useScrollEngine } from "@/lib/scroll-engine";
import { useUi } from "@/lib/store";
import Nav from "./Nav";
import PreOrderDialog from "./ui/PreOrderDialog";

const SceneCanvas = dynamic(() => import("./canvas/SceneCanvas"), {
  ssr: false,
});

function supportsWebGL2() {
  try {
    const probe = document.createElement("canvas");
    const gl = probe.getContext("webgl2");
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

/** CSS-only stand-in: keeps the composition when WebGL is unavailable. */
function CanvasFallback() {
  return (
    <div className="nova-fallback" data-canvas-fallback aria-hidden="true">
      <div className="nova-fallback-body">
        <span className="nova-fallback-ring" />
      </div>
    </div>
  );
}

/**
 * R3F re-throws whatever the scene throws — a failed HDRI fetch, a three.js
 * assertion, a driver giving up — and an uncaught throw takes the entire React
 * root down with it, so a decorative canvas can turn the site white. The 3D is
 * allowed to fail here; it just has to fail into the CSS stand-in.
 */
class CanvasBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    // warn, not error: a page that fell back cleanly is not a broken page
    console.warn("[nova] 3D scene failed — using the CSS fallback", error);
  }

  render() {
    return this.state.failed ? <CanvasFallback /> : this.props.children;
  }
}

export default function SiteShell({ children }: { children: ReactNode }) {
  useScrollEngine();
  const setCapture = useUi((s) => s.setCapture);
  const navOpen = useUi((s) => s.navOpen);
  const dialogOpen = useUi((s) => s.dialogOpen);
  const [mode, setMode] = useState<"pending" | "gl" | "off">("pending");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    // og implies freeze: a share card must never depend on an animation phase
    const og = q.get("og") === "1";
    const freeze = og || q.get("freeze") === "1";
    const root = document.documentElement;
    if (freeze) root.dataset.freeze = "true";
    if (og) root.dataset.og = "true";
    setCapture({ freeze, og });
    setMode(q.get("nogl") === "1" || !supportsWebGL2() ? "off" : "gl");
  }, [setCapture]);

  return (
    <>
      <div className="nova-ambient" aria-hidden="true" />
      {mode === "gl" ? (
        <CanvasBoundary>
          {/* a lost GPU context leaves a live-looking canvas that will never
              paint again — hand the stage to the fallback instead */}
          <SceneCanvas onContextLost={() => setMode("off")} />
        </CanvasBoundary>
      ) : null}
      {mode === "off" ? <CanvasFallback /> : null}
      <Nav />
      {/* while an overlay owns the screen the page behind it leaves the tab
          order and the accessibility tree, instead of staying a silent second
          document a screen reader can wander into */}
      <div data-page inert={navOpen || dialogOpen}>
        {children}
      </div>
      <PreOrderDialog />
    </>
  );
}
