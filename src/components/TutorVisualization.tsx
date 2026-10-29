import React, { Component, type ReactNode } from 'react';
import type { EducationalVisualModel, TutorVisualSpec, VisualizationType } from '../types';
import { VisualModelViewer } from './visuals/VisualModelViewer';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMsg: string;
}

class VisualizationErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMsg: error.message || 'Render error' };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.warn('[TutorVisualization Error]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="tutor-visual-fallback-box" role="alert">
          <div className="fallback-badge">ℹ️ Visual Simulation Notice</div>
          <p className="fallback-text">
            Unable to render dynamic graphics for &ldquo;{this.props.fallbackTitle || 'this concept'}&rdquo; in this browser session ({this.state.errorMsg}).
            The full written lesson and code samples above remain fully intact.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export interface TutorVisualizationProps {
  visual?: TutorVisualSpec;
  visualModel?: EducationalVisualModel;
  visualType?: VisualizationType;
  visualTitle?: string;
  visualDescription?: string;
}

/**
 * TutorVisualization
 * Connects the AI Tutor message pipeline to interactive educational simulations.
 * Displays the dedicated "Visual Explanation" section with playback controls.
 */
export const TutorVisualization: React.FC<TutorVisualizationProps> = ({
  visual,
  visualModel,
  visualType,
  visualTitle,
  visualDescription
}) => {
  // Resolve underlying model specification
  const activeModel: EducationalVisualModel | undefined = visual?.model || visualModel;

  // Never render a blank panel or broken canvas for unsupported topics
  if (!activeModel) {
    return null;
  }

  const effectiveType: VisualizationType = visual?.visualType || visualType || (activeModel.is3D ? '3d' : 'diagram');
  const title = visual?.visualTitle || visualTitle || activeModel.title;
  const description = visual?.visualDescription || visualDescription || activeModel.caption || activeModel.summary;

  // Type badge formatting
  const typeBadgeConfig = {
    diagram: { label: 'Conceptual Diagram', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' },
    process: { label: 'Step-by-Step Process', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
    simulation: { label: 'Interactive Simulation', color: '#818cf8', bg: 'rgba(99, 102, 241, 0.14)' },
    '3d': { label: '✦ Genuine 3D Model', color: '#c084fc', bg: 'rgba(168, 85, 247, 0.15)' }
  }[effectiveType] || { label: 'Visual Model', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.12)' };

  return (
    <div className="tutor-visual-explanation-container" data-visual-type={effectiveType}>
      {/* 1. Explicit Visual Explanation Section Header */}
      <div className="visual-explanation-section-banner">
        <div className="section-banner-meta">
          <span className="section-kicker">INTERACTIVE PEDAGOGY</span>
          <h3 className="section-headline">Visual Explanation</h3>
        </div>

        <div className="section-banner-badges">
          <span
            className="visual-type-pill"
            style={{ color: typeBadgeConfig.color, background: typeBadgeConfig.bg, borderColor: typeBadgeConfig.color }}
          >
            {typeBadgeConfig.label}
          </span>
          <span className="visual-category-pill">{activeModel.category}</span>
        </div>
      </div>

      {/* Description subtitle */}
      {description && (
        <p className="visual-explanation-summary">{description}</p>
      )}

      {/* 2. Interactive Simulation Stage Wrapped with Error Boundary */}
      <VisualizationErrorBoundary fallbackTitle={title}>
        <div className="visual-player-shell">
          <VisualModelViewer model={activeModel} />
        </div>
      </VisualizationErrorBoundary>
    </div>
  );
};
