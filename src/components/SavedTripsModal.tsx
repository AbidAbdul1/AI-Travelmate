import React from 'react';
import { ItineraryPlan } from '../types/travel';
import { Bookmark, Calendar, Trash2, ArrowRight, X, Clock, MapPin, IndianRupee } from 'lucide-react';

interface SavedTripsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedTrips: ItineraryPlan[];
  onLoadTrip: (trip: ItineraryPlan) => void;
  onDeleteTrip: (tripId: string) => void;
}

export const SavedTripsModal: React.FC<SavedTripsModalProps> = ({
  isOpen,
  onClose,
  savedTrips,
  onLoadTrip,
  onDeleteTrip,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                My Saved Itineraries
              </h2>
              <p className="text-xs text-slate-500">
                {savedTrips.length} saved travel plans in repository
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of saved trips */}
        <div className="p-6 overflow-y-auto space-y-3">
          {savedTrips.length === 0 ? (
            <div className="text-center py-8">
              <Bookmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No saved itineraries yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Generate an itinerary or modify stops, then click "Save to My Trips".
              </p>
            </div>
          ) : (
            savedTrips.map((trip) => {
              const formattedDate = new Date(trip.updatedAt || trip.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={trip.id}
                  className="bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                      <span>{formattedDate}</span>
                      <span>·</span>
                      <span>{trip.days.length} Day(s)</span>
                      <span>·</span>
                      <span>{trip.totalDestinations} Stops</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      {trip.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-1">
                      {trip.aiExplanation || `Origin: ${trip.startingLocation.name}`}
                    </p>

                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 font-mono">
                      <span>Budget: ~₹{trip.totalEstimatedBudgetINR}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onDeleteTrip(trip.id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete trip"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onLoadTrip(trip);
                        onClose();
                      }}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Load Plan</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
