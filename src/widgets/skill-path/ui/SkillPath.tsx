import React, { useState, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { Lock, Check, Play, ChevronRight, BookOpen, Code } from 'lucide-react';
import type { SkillNode } from '../../../entities/curriculum/model/types';
import { vibrateTick, vibrateError } from '../../../shared/lib/haptics/vibrate';

interface SkillPathProps {
  nodes: SkillNode[];
  completedSkillIds: string[];
  onStartLesson: (skillId: string, lessonId: string) => void;
  vibrationEnabled: boolean;
  masteredSlides?: string[];
}

export const SkillPath: React.FC<SkillPathProps> = ({
  nodes,
  completedSkillIds,
  onStartLesson,
  vibrationEnabled,
  masteredSlides = [],
}) => {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Group nodes by category
  const grouped = useMemo(() => {
    const map = new Map<string, SkillNode[]>();
    nodes.forEach(node => {
      const list = map.get(node.category || 'Tools') || [];
      list.push(node);
      map.set(node.category || 'Tools', list);
    });
    return Array.from(map.entries());
  }, [nodes]);

  // Calculate per-node progress
  const getNodeProgress = (node: SkillNode) => {
    let total = 0;
    let mastered = 0;
    node.lessons.forEach(lesson => {
      lesson.slides.forEach((_, si) => {
        total++;
        if (masteredSlides.includes(`${node.id}_${lesson.id}_slide_${si}`)) mastered++;
      });
    });
    return { total, mastered, percent: total > 0 ? Math.round((mastered / total) * 100) : 0 };
  };

  const handleNodeClick = (node: SkillNode, isUnlocked: boolean) => {
    if (isUnlocked) {
      vibrateTick(vibrationEnabled);
    } else {
      vibrateError(vibrationEnabled);
      return;
    }
    setSelectedNode(selectedNode?.id === node.id ? null : node);
  };

  // Progress ring SVG helper
  const ProgressRing = ({ percent, size = 40, stroke = 3 }: { percent: number; size?: number; stroke?: number }) => {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c - (percent / 100) * c;
    return (
      <svg width={size} height={size} className="progress-ring-svg">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={percent === 100 ? 'var(--color-success)' : 'var(--color-accent)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
    );
  };

  return (
    <div className="skill-path-v2">
      {grouped.map(([category, categoryNodes]) => (
        <div key={category} className="path-category-group">
          <div className="category-header">
            <span className="category-dot" />
            <span className="category-name">{category}</span>
          </div>

          <div className="category-nodes">
            {categoryNodes.map((node, categoryIndex) => {
              const isCompleted = completedSkillIds.includes(node.id);
              // First node of each category is always unlocked; subsequent nodes require previous in same category
              const isUnlocked = categoryIndex === 0 ||
                completedSkillIds.includes(categoryNodes[categoryIndex - 1].id);
              const isActive = isUnlocked && !isCompleted;
              const isSelected = selectedNode?.id === node.id;
              const progress = getNodeProgress(node);
              const IconComponent = (Icons as any)[node.iconName || 'Code'] || Icons.Code;
              const theoryCount = node.lessons.reduce((a, l) => a + l.slides.filter(s => s.type === 'theory').length, 0);
              const practiceCount = node.lessons.reduce((a, l) => a + l.slides.filter(s => s.type !== 'theory').length, 0);

              return (
                <React.Fragment key={node.id}>
                  <button
                    className={`path-node-card ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${!isUnlocked ? 'locked' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleNodeClick(node, isUnlocked)}
                  >
                    {/* Left: icon circle */}
                    <div className={`node-icon-circle ${isCompleted ? 'done' : isActive ? 'current' : 'off'}`}>
                      {isCompleted ? (
                        <Check size={18} />
                      ) : !isUnlocked ? (
                        <Lock size={14} />
                      ) : (
                        <IconComponent size={18} />
                      )}
                    </div>

                    {/* Center: info */}
                    <div className="node-info">
                      <span className="node-title">{node.title}</span>
                      <div className="node-meta">
                        {theoryCount > 0 && (
                          <span className="meta-chip theory">
                            <BookOpen size={10} />
                            {theoryCount}
                          </span>
                        )}
                        {practiceCount > 0 && (
                          <span className="meta-chip practice">
                            <Code size={10} />
                            {practiceCount}
                          </span>
                        )}
                        {isUnlocked && progress.percent > 0 && progress.percent < 100 && (
                          <span className="meta-chip progress-chip">
                            {progress.percent}%
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right: progress ring or status */}
                    <div className="node-right">
                      {isCompleted ? (
                        <div className="done-badge">
                          <Check size={14} />
                        </div>
                      ) : isUnlocked ? (
                        <div className="ring-wrap">
                          <ProgressRing percent={progress.percent} size={36} stroke={3} />
                          <ChevronRight size={14} className="chevron-icon" />
                        </div>
                      ) : (
                        <Lock size={14} className="lock-dim" />
                      )}
                    </div>
                  </button>

                  {/* Expanded lesson drawer inline */}
                  {isSelected && isUnlocked && (
                    <div className="inline-drawer">
                      {node.description && (
                        <p className="drawer-desc">{node.description}</p>
                      )}
                      <div className="drawer-lessons-list">
                        {node.lessons.map(lesson => (
                          <button
                            key={lesson.id}
                            className="lesson-row"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedNode(null);
                              onStartLesson(node.id, lesson.id);
                            }}
                          >
                            <Play size={12} fill="currentColor" className="lesson-play-icon" />
                            <span className="lesson-title">{lesson.title}</span>
                            <span className="lesson-xp">+{lesson.xpReward} XP</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      ))}

      <style>{`
        .skill-path-v2 {
          display: flex;
          flex-direction: column;
          gap: 28px;
          max-width: 520px;
          margin: 0 auto;
          width: 100%;
        }

        /* Category group */
        .path-category-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .category-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 4px;
          margin-bottom: 4px;
        }

        .category-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--color-accent);
          box-shadow: 0 0 8px rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
        }

        .category-name {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--text-muted);
        }

        .category-nodes {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        /* Node card */
        .path-node-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
          width: 100%;
          font-family: inherit;
          color: inherit;
          position: relative;
          overflow: hidden;
        }

        .path-node-card:hover:not(.locked) {
          background: var(--bg-card-hover);
          border-color: rgba(255,255,255,0.12);
        }

        .path-node-card.active {
          border-color: rgba(99, 102, 241, 0.3);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.06) 0%, rgba(15, 23, 42, 0.8) 100%);
        }

        .path-node-card.active::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--color-accent);
          border-radius: 0 3px 3px 0;
        }

        .path-node-card.completed {
          border-color: rgba(16, 185, 129, 0.15);
        }

        .path-node-card.completed::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 3px;
          background: var(--color-success);
          border-radius: 0 3px 3px 0;
        }

        .path-node-card.locked {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .path-node-card.selected:not(.locked) {
          border-color: rgba(99, 102, 241, 0.4);
          background: rgba(99, 102, 241, 0.08);
        }

        /* Icon circle */
        .node-icon-circle {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-fast);
        }

        .node-icon-circle.done {
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
        }

        .node-icon-circle.current {
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
        }

        .node-icon-circle.off {
          background: rgba(255,255,255,0.03);
          color: var(--text-muted);
        }

        /* Info */
        .node-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .node-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .path-node-card.locked .node-title {
          color: var(--text-muted);
        }

        .node-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          flex-wrap: wrap;
        }

        .meta-chip {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }

        .meta-chip.theory {
          background: rgba(99,102,241,0.08);
          color: #818cf8;
        }

        .meta-chip.practice {
          background: rgba(16,185,129,0.08);
          color: #6ee7b7;
        }

        .meta-chip.progress-chip {
          background: rgba(245,158,11,0.1);
          color: var(--color-warning);
        }

        /* Right side */
        .node-right {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .ring-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .progress-ring-svg {
          display: block;
        }

        .chevron-icon {
          position: absolute;
          color: var(--text-muted);
          transition: color var(--transition-fast);
        }

        .path-node-card:hover .chevron-icon {
          color: var(--color-accent);
        }

        .done-badge {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-full);
          background: rgba(16,185,129,0.15);
          color: var(--color-success);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lock-dim {
          color: var(--text-muted);
          opacity: 0.4;
        }

        /* Inline drawer */
        .inline-drawer {
          padding: 12px 16px 16px;
          margin-top: -4px;
          background: rgba(99, 102, 241, 0.04);
          border: 1px solid rgba(99,102,241,0.12);
          border-top: none;
          border-radius: 0 0 var(--radius-md) var(--radius-md);
          animation: drawer-expand 0.2s ease-out;
        }

        @keyframes drawer-expand {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 400px; }
        }

        .drawer-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .drawer-lessons-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .lesson-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: inherit;
          color: inherit;
          width: 100%;
          text-align: left;
        }

        .lesson-row:hover {
          background: rgba(99,102,241,0.08);
          border-color: rgba(99,102,241,0.2);
        }

        .lesson-play-icon {
          color: var(--color-accent);
          flex-shrink: 0;
        }

        .lesson-title {
          flex: 1;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lesson-xp {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-warning);
          flex-shrink: 0;
          white-space: nowrap;
        }

        @media (max-width: 480px) {
          .path-node-card {
            padding: 12px 14px;
            gap: 12px;
          }
          .node-icon-circle {
            width: 36px;
            height: 36px;
          }
          .node-title {
            font-size: 13px;
          }
          .lesson-row {
            padding: 8px 10px;
          }
          .lesson-title {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
};
