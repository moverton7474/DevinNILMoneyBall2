import React from 'react';
import { Player } from '../../types/moneyball';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Star, 
  Award,
  ArrowRight 
} from 'lucide-react';
import { Button } from '../ui/Button';

interface PlayerCardProps {
  player: Player;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getValueRating = (valuePerDollar?: number) => {
    if (!valuePerDollar) return { rating: 'Unknown', color: 'text-gray-500', stars: 0 };
    if (valuePerDollar >= 5.0) return { rating: 'Elite Value', color: 'text-green-600', stars: 5 };
    if (valuePerDollar >= 3.0) return { rating: 'High Value', color: 'text-green-500', stars: 4 };
    if (valuePerDollar >= 2.0) return { rating: 'Good Value', color: 'text-blue-500', stars: 3 };
    if (valuePerDollar >= 1.0) return { rating: 'Fair Value', color: 'text-yellow-500', stars: 2 };
    return { rating: 'Poor Value', color: 'text-red-500', stars: 1 };
  };

  const valueRating = getValueRating(player.evaluation?.valuePerDollar);

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-gray-900">{player.name}</h3>
            {player.transferFrom === 'FCS' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                FCS
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span className="font-medium">{player.position}</span>
            <span>•</span>
            <span>{player.previousSchool}</span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{player.daysInPortal} days in portal</span>
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-lg font-bold text-gray-900">
            {formatCurrency(player.marketValue)}
          </div>
          <div className={`text-sm font-medium ${valueRating.color}`}>
            {valueRating.rating}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {player.evaluation && (
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 bg-blue-50 rounded">
            <div className="text-sm font-bold text-blue-700">
              {player.evaluation.productionScore}
            </div>
            <div className="text-xs text-blue-600">Production</div>
          </div>
          <div className="p-2 bg-green-50 rounded">
            <div className="text-sm font-bold text-green-700">
              {player.evaluation.efficiencyRating}
            </div>
            <div className="text-xs text-green-600">Efficiency</div>
          </div>
          <div className="p-2 bg-purple-50 rounded">
            <div className="text-sm font-bold text-purple-700">
              {player.evaluation.positionalImpact}
            </div>
            <div className="text-xs text-purple-600">Impact</div>
          </div>
        </div>
      )}

      {/* Value Metrics */}
      {player.evaluation && (
        <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded">
          <div className="text-sm">
            <span className="text-gray-600">Value per $1K:</span>
            <span className={`ml-1 font-bold ${valueRating.color}`}>
              {player.evaluation.valuePerDollar.toFixed(1)}
            </span>
          </div>
          
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < valueRating.stars 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Baron Hopson Comparison */}
      {player.evaluation?.baronHopsonComparison && (
        <div className="mb-3 p-2 bg-emerald-50 border border-emerald-200 rounded">
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-800">
              Baron Hopson Similarity: {player.evaluation.baronHopsonComparison.similarity}%
            </span>
          </div>
          <p className="text-xs text-emerald-700">
            Similar profile to the KSU linebacker success story
          </p>
        </div>
      )}

      {/* Stats Preview */}
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">Key Stats:</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {player.position === 'LB' && player.stats.totalTackles && (
            <>
              <div>Tackles: {player.stats.totalTackles}</div>
              <div>Solo: {player.stats.soloTackles || 0}</div>
            </>
          )}
          {player.position === 'QB' && player.stats.passingYards && (
            <>
              <div>Pass Yds: {player.stats.passingYards?.toLocaleString()}</div>
              <div>TDs: {player.stats.passingTDs}</div>
            </>
          )}
          {player.position === 'RB' && player.stats.rushingYards && (
            <>
              <div>Rush Yds: {player.stats.rushingYards?.toLocaleString()}</div>
              <div>TDs: {player.stats.rushingTDs}</div>
            </>
          )}
          {player.position === 'WR' && player.stats.receivingYards && (
            <>
              <div>Rec Yds: {player.stats.receivingYards?.toLocaleString()}</div>
              <div>Receptions: {player.stats.receptions}</div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="flex-1">
          <Target className="w-4 h-4 mr-1" />
          Evaluate
        </Button>
        
        <Button 
          size="sm" 
          className={`flex-1 ${
            valueRating.stars >= 4 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-1" />
          {valueRating.stars >= 4 ? 'Priority Target' : 'Add to Watch'}
        </Button>
        
        <Button variant="ghost" size="sm" className="px-2">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default PlayerCard;