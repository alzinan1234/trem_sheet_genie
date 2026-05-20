import React, { useState } from 'react';
import { Trash2, Plus, ChevronRight } from 'lucide-react';

interface Scenario {
  id: number;
  name: string;
}

interface SidebarProps {
  activeScenario: number;
  setActiveScenario: (id: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeScenario, setActiveScenario }) => {
  // Scenario list ke state e niye asha hoyeche jate dynamic kora jay
  const [scenarios, setScenarios] = useState<Scenario[]>([
    { id: 1, name: 'Scenario 1' },
    { id: 2, name: 'Scenario 2' },
  ]);

  // Notun scenario add korar function
  const addScenario = () => {
    const nextId = scenarios.length > 0 ? Math.max(...scenarios.map(s => s.id)) + 1 : 1;
    const newScenario = { id: nextId, name: `Scenario ${nextId}` };
    setScenarios([...scenarios, newScenario]);
    setActiveScenario(nextId); // Notun ta add hoye auto select hobe
  };

  // Scenario delete korar function
  const deleteScenario = (id: number) => {
    const updatedScenarios = scenarios.filter(s => s.id !== id);
    setScenarios(updatedScenarios);
    
    // Jodi active scenario delete hoy, tobe list er prothom ta select hobe
    if (activeScenario === id && updatedScenarios.length > 0) {
      setActiveScenario(updatedScenarios[0].id);
    }
  };

  return (
    <div className="w-64 flex-shrink-0">
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-[13px] font-bold text-[#1e293b]">Scenario Selection</span>
          <div className="bg-gray-100 p-1 rounded-md cursor-pointer hover:bg-gray-200 transition-colors">
            <ChevronRight size={14} className="text-gray-400 rotate-180" />
          </div>
        </div>

        {/* Scenario List */}
        <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
          {scenarios.map((scenario) => (
            <div 
              key={scenario.id}
              onClick={() => setActiveScenario(scenario.id)}
              className={`
                flex items-center justify-between p-3 rounded-lg cursor-pointer group transition-all duration-200
                ${activeScenario === scenario.id 
                  ? 'bg-blue-50 border-l-4 border-blue-600 shadow-sm' 
                  : 'hover:bg-gray-50 border-l-4 border-transparent'}
              `}
            >
              <span className={`
                text-[13px] transition-colors
                ${activeScenario === scenario.id ? 'text-blue-700 font-bold' : 'text-gray-600 font-medium'}
              `}>
                {scenario.name}
              </span>
              
              <button 
                className="text-gray-300 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all p-1"
                onClick={(e) => {
                  e.stopPropagation(); // Parent click prevent korar jonno
                  deleteScenario(scenario.id);
                }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {scenarios.length === 0 && (
            <p className="text-[11px] text-gray-400 text-center py-4 italic">No scenarios added.</p>
          )}
        </div>

        {/* Add Scenario Button (Functional) */}
        <button 
          onClick={addScenario}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 border border-blue-600 rounded-full text-blue-600 text-[13px] font-bold hover:bg-blue-50 transition-all duration-200 active:scale-95"
        >
          <Plus size={16} /> Add scenario
        </button>

        {/* Pro Tip Section */}
        <div className="mt-8 p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-100 shadow-inner">
            <p className="text-[11px] text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700 block mb-1 underline decoration-blue-200">Pro Tip:</span> 
                Compare different exit valuations to see your effective ownership and potential dilution.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;