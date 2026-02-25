import { useMemo, useState } from 'react';
import { SKILLS_TAXONOMY } from '../../data/skillsTaxonomy';
import Button from './Button';

function parseSkills(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value || '')
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export default function SkillSelector({ value, onChange, label = 'Skills' }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');

  const selectedSkills = useMemo(() => parseSkills(value), [value]);

  const categoryOptions = SKILLS_TAXONOMY.map((item) => item.category);

  const subcategoryOptions = useMemo(() => {
    const group = SKILLS_TAXONOMY.find((item) => item.category === selectedCategory);
    return group ? group.subcategories.map((sub) => sub.name) : [];
  }, [selectedCategory]);

  const skillOptions = useMemo(() => {
    const group = SKILLS_TAXONOMY.find((item) => item.category === selectedCategory);
    if (!group) return [];
    const sub = group.subcategories.find((entry) => entry.name === selectedSubcategory);
    return sub ? sub.skills : [];
  }, [selectedCategory, selectedSubcategory]);

  const setSkills = (items) => onChange(items.join(', '));

  const addSkill = () => {
    if (!selectedSkill || selectedSkills.includes(selectedSkill)) return;
    setSkills([...selectedSkills, selectedSkill]);
    setSelectedSkill('');
  };

  const removeSkill = (skill) => {
    setSkills(selectedSkills.filter((item) => item !== skill));
  };

  return (
    <div className="stack">
      <label className="label">{label}</label>
      <div className="grid grid-3">
        <select
          className="select"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubcategory('');
            setSelectedSkill('');
          }}
        >
          <option value="">Select Category</option>
          {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>

        <select
          className="select"
          value={selectedSubcategory}
          onChange={(e) => {
            setSelectedSubcategory(e.target.value);
            setSelectedSkill('');
          }}
          disabled={!selectedCategory}
        >
          <option value="">Select Subcategory</option>
          {subcategoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>

        <select
          className="select"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          disabled={!selectedSubcategory}
        >
          <option value="">Select Skill</option>
          {skillOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="row">
        <Button type="button" variant="secondary" onClick={addSkill} disabled={!selectedSkill}>
          Add Skill
        </Button>
      </div>

      <div className="selected-skills">
        {selectedSkills.length ? (
          selectedSkills.map((skill) => (
            <button key={skill} type="button" className="skill-chip" onClick={() => removeSkill(skill)}>
              {skill} x
            </button>
          ))
        ) : (
          <p className="muted">No skills selected yet.</p>
        )}
      </div>
    </div>
  );
}
