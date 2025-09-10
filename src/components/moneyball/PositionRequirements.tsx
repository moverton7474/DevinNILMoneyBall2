import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Users, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/Button';

interface PositionRequirementsProps {
  requirements: Record<string, number>;
  onRequirementsChange: (requirements: Record<string, number>) => void;
}

const PositionRequirements: React.FC<PositionRequirementsProps> = ({
  requirements,
  onRequirementsChange
}) => {
  const positions = [
    { key: 'QB', label: 'Quarterback', color: 'bg-red-100 text-red-800' },
    { key: 'RB', label: 'Running Back', color: 'bg-green-100 text-green-800' },
    { key: 'WR', label: 'Wide Receiver', color: 'bg-blue-100 text-blue-800' },
    { key: 'TE', label: 'Tight End', color: 'bg-purple-100 text-purple-800' },
    { key: 'OL', label: 'Offensive Line', color: 'bg-yellow-100 text-yellow-800' },
    { key: 'DL', label: 'Defensive Line', color: 'bg-gray-100 text-gray-800' },
    { key: 'LB', label: 'Linebacker', color: 'bg-orange-100 text-orange-800' },
    { key: 'DB', label: 'Defensive Back', color: 'bg-indigo-100 text-indigo-800' }
  ];

  const updateRequirement = (position: string, change: number) => {
    const newValue = Math.max(0, Math.min(10, requirements[position] + change));
    onRequirementsChange({
      ...requirements,
      [position]: newValue
    });
  };

  const totalPlayers = Object.values(requirements).reduce((sum, count) => sum + count, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Position Requirements
        </CardTitle>
        <p className="text-sm text-gray-600">
          Set minimum player requirements for each position group (Total: {totalPlayers} players)
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {positions.map((position) => (
            <div key={position.key} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{position.key}</h4>
                  <p className="text-xs text-gray-600">{position.label}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${position.color}`}>
                  {position.key}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRequirement(position.key, -1)}
                  disabled={requirements[position.key] <= 0}
                  className="w-8 h-8 p-0"
                >
                  <Minus className="w-3 h-3" />
                </Button>
                
                <div className="text-center px-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {requirements[position.key]}
                  </div>
                  <div className="text-xs text-gray-500">players</div>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateRequirement(position.key, 1)}
                  disabled={requirements[position.key] >= 10}
                  className="w-8 h-8 p-0"
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Total Roster Requirements:</span>
            <span className="text-lg font-bold text-gray-900">{totalPlayers} players</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PositionRequirements;