import React from 'react';
import { SKILL_NODES } from '../../../entities/curriculum/model/questions';
import { SkillPath } from '../../../widgets/skill-path/ui/SkillPath';

interface MapPageProps {
  completedSkills: string[];
  onStartLesson: (skillId: string, lessonId: string) => void;
  vibrationEnabled: boolean;
  masteredSlides: string[];
}

export const MapPage: React.FC<MapPageProps> = ({
  completedSkills,
  onStartLesson,
  vibrationEnabled,
  masteredSlides,
}) => {
  return (
    <div className="anim-slide-in">
      <SkillPath
        nodes={SKILL_NODES}
        completedSkillIds={completedSkills}
        onStartLesson={onStartLesson}
        vibrationEnabled={vibrationEnabled}
        masteredSlides={masteredSlides}
      />
    </div>
  );
};
