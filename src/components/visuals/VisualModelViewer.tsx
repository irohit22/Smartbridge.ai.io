import React, { useState, useEffect, useRef } from 'react';
import type { EducationalVisualModel } from '../../types';
import { CPUArchitectureModel } from './CPUArchitectureModel';
import { PhotosynthesisModel } from './PhotosynthesisModel';
import { WaterCycleModel } from './WaterCycleModel';
import { HumanHeartModel } from './HumanHeartModel';
import { SolarSystemModel } from './SolarSystemModel';
import { NeuralNetworkModel } from './NeuralNetworkModel';
import { ElectricCircuitModel } from './ElectricCircuitModel';
import { BinarySearchModel } from './BinarySearchModel';
import { JSPromiseModel } from './JSPromiseModel';
import { SQLJoinModel } from './SQLJoinModel';
import { OSSchedulingModel } from './OSSchedulingModel';
import { PythagoreanTheoremModel } from './PythagoreanTheoremModel';
import { GenericProcessFlowModel } from './GenericProcessFlowModel';

interface VisualModelViewerProps {
  model: EducationalVisualModel;
  initialSpeed?: number;
}

export const VisualModelViewer: React.FC<VisualModelViewerProps> = ({
  model,
  initialSpeed = 1
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState<number>(initialSpeed);
  const totalSteps = model.steps.length;

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play timer advances step every 3.5 seconds / speed
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.max(1200, 3600 / speed);
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % totalSteps);
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, totalSteps]);

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handlePrevStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev > 0 ? prev - 1 : totalSteps - 1));
  };

  const handleNextStep = () => {
    setIsPlaying(false);
    setCurrentStepIndex((prev) => (prev + 1) % totalSteps);
  };

  const handleRestart = () => {
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
  };

  const currentStep = model.steps[currentStepIndex] || model.steps[0];
  const stepNumber = currentStepIndex + 1;

  // Render matching visual diagram
  const renderVisualDiagram = () => {
    const props = { step: stepNumber, isPlaying, speed };

    switch (model.type) {
      case 'cpu-architecture':
        return <CPUArchitectureModel {...props} />;
      case 'photosynthesis':
        return <PhotosynthesisModel {...props} />;
      case 'water-cycle':
        return <WaterCycleModel {...props} />;
      case 'human-heart':
        return <HumanHeartModel {...props} />;
      case 'solar-system':
        return <SolarSystemModel {...props} />;
      case 'neural-network':
        return <NeuralNetworkModel {...props} />;
      case 'electric-circuit':
        return <ElectricCircuitModel {...props} />;
      case 'binary-search':
        return <BinarySearchModel {...props} />;
      case 'js-promise-flow':
        return <JSPromiseModel {...props} />;
      case 'sql-join-venn':
        return <SQLJoinModel {...props} />;
      case 'os-scheduling':
        return <OSSchedulingModel {...props} />;
      case 'pythagorean-theorem':
        return <PythagoreanTheoremModel {...props} />;
      case 'generic-process-flow':
      default:
        return <GenericProcessFlowModel {...props} />;
    }
  };

  return (
    <div className="visual-model-card" data-model-type={model.type}>
      {/* 1. Header Bar */}
      <div className="visual-model-header">
        <div className="visual-header-left">
          <span className="visual-category-badge">{model.category}</span>
          {model.is3D && <span className="visual-3d-badge">✦ Interactive 3D</span>}
          <h4 className="visual-model-title">{model.title}</h4>
        </div>
        <div className="visual-header-right">
          <span className="visual-step-counter">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
      </div>

      {/* 2. Visual Canvas Region */}
      <div className="visual-model-stage">{renderVisualDiagram()}</div>

      {/* 3. Controls Playback Toolbar */}
      <div className="visual-model-toolbar">
        <div className="toolbar-playback-cluster">
          {/* Play / Pause */}
          <button
            type="button"
            className="visual-ctrl-btn btn-play-pause"
            onClick={handleTogglePlay}
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>

          {/* Prev Step */}
          <button
            type="button"
            className="visual-ctrl-btn btn-step-nav btn-step-back"
            onClick={handlePrevStep}
            title="Previous step"
            aria-label="Previous step"
          >
            ◀ Prev
          </button>

          {/* Next Step */}
          <button
            type="button"
            className="visual-ctrl-btn btn-step-nav btn-step-fwd"
            onClick={handleNextStep}
            title="Next step"
            aria-label="Next step"
          >
            Next ▶
          </button>

          {/* Restart */}
          <button
            type="button"
            className="visual-ctrl-btn btn-restart"
            onClick={handleRestart}
            title="Restart from Step 1"
            aria-label="Restart"
          >
            ↺ Restart
          </button>
        </div>

        {/* Step Scrubber Dots */}
        <div className="toolbar-step-scrubber" role="tablist" aria-label="Simulation Steps">
          {model.steps.map((st, sIdx) => {
            const isActive = sIdx === currentStepIndex;
            return (
              <button
                key={sIdx}
                type="button"
                className={`step-scrubber-dot ${isActive ? 'active' : ''}`}
                onClick={() => {
                  setCurrentStepIndex(sIdx);
                  setIsPlaying(false);
                }}
                title={`Jump to Step ${sIdx + 1}: ${st.label}`}
                aria-label={`Step ${sIdx + 1}: ${st.label}`}
                aria-selected={isActive}
              >
                <span className="dot-index">{sIdx + 1}</span>
                <span className="dot-label-tooltip">{st.label}</span>
              </button>
            );
          })}
        </div>

        {/* Playback Speed Controls */}
        <div className="toolbar-speed-cluster">
          <span className="speed-cluster-label">Speed:</span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              type="button"
              className={`visual-speed-btn ${speed === s ? 'active' : ''}`}
              onClick={() => handleSpeedChange(s)}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* 4. Synced Explanatory Caption Card */}
      <div className="visual-caption-card">
        <div className="caption-card-header">
          <span className="caption-step-pill">Phase {stepNumber}</span>
          <h5 className="caption-step-title">{currentStep.label}</h5>
        </div>
        <p className="caption-step-description">{currentStep.description}</p>

        {/* Active Elements / Parameters tags */}
        {currentStep.activeElements && currentStep.activeElements.length > 0 && (
          <div className="caption-tags-row">
            <span className="caption-tags-label">Active Components:</span>
            {currentStep.activeElements.map((el) => (
              <span key={el} className="caption-element-tag">
                {el.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {model.interactiveParams && (
          <div className="caption-params-summary">
            {Object.entries(model.interactiveParams).slice(0, 3).map(([key, val]) => (
              <span key={key} className="param-item">
                <strong>{key}:</strong> {String(val)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
