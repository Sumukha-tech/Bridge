import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, Users, Ticket } from 'lucide-react';
import { Card, Button } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Event } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { formatDate, cn } from '../../lib/utils';
import { motion } from 'motion/react';

const EventCard = ({ event, isPast, userId, onRegister }: { event: Event; isPast?: boolean; userId?: string; onRegister: (id: string) => void; key?: string }) => {
  const isRegistered = event.attendees.includes(userId || '');
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={cn(
        "p-1 rounded-[3rem] transition-all duration-500",
        isRegistered ? "bg-gradient-to-br from-indigo-600 to-purple-600" : "bg-white/40",
        isPast && "opacity-60 saturate-50"
      )}>
        <div className="glass-card p-10 h-full border-transparent bg-white/80 rounded-[2.8rem]">
          <div className="flex justify-between items-start mb-6">
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner",
              isPast ? "bg-slate-100 text-slate-400" : "bg-indigo-50 text-indigo-600"
            )}>
              <Calendar className="w-7 h-7" />
            </div>
            {isRegistered && !isPast && (
              <div className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-xs font-black uppercase flex items-center shadow-sm">
                <Ticket className="w-3 h-3 mr-2" />
                Reserved
              </div>
            )}
            {isPast && (
              <div className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                Concluded
              </div>
            )}
          </div>

          <h3 className="text-2xl font-black text-slate-800 mb-2 truncate">{event.title}</h3>
          <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{event.description}</p>

          <div className="space-y-3 mb-8">
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <Calendar className="w-4 h-4 mr-3 opacity-50" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center text-sm text-slate-600 font-medium">
              <MapPin className="w-4 h-4 mr-3 opacity-50" />
              {event.location}
            </div>
          </div>

          {!isPast && (
            <Button 
              variant={isRegistered ? "outline" : "primary"} 
              className="w-full rounded-2xl h-12 font-bold transition-all text-sm"
              onClick={() => onRegister(event.id)}
              disabled={isRegistered}
            >
              {isRegistered ? "View Admission Pass" : "Register Now"}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const StudentEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  useEffect(() => {
    const fetchEvents = async () => {
      const data = await firebaseService.getEvents();
      // Sort: Upcoming soonest first, Past latest first
      const sorted = (data as Event[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(sorted);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: string) => {
    if (!user) return;
    await firebaseService.registerForEvent(eventId, user.id);
    const updated = await firebaseService.getEvents();
    setEvents(updated as Event[]);
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-white tracking-tight">Campus Events</h2>
        <div className="bg-white/20 backdrop-blur-md border border-white/30 px-6 py-2 rounded-2xl text-white font-bold text-sm">
          {upcomingEvents.length} Active Opportunities
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
           {[1, 2].map(i => <div key={i} className="h-64 bg-white/20 rounded-[3rem]" />)}
        </div>
      ) : (
        <>
          <section className="space-y-8">
            <div className="flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse border-2 border-white"></div>
              </span>
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">Upcoming Activities</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <Card className="p-20 text-center text-white/50">
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-xl font-bold">No upcoming events found</p>
                <p className="text-sm mt-2">Check back later for new workshops.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {upcomingEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    userId={user?.id} 
                    onRegister={handleRegister} 
                  />
                ))}
              </div>
            )}
          </section>

          {pastEvents.length > 0 && (
            <section className="space-y-8 opacity-80">
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-white/40"></div>
                </span>
                <h3 className="text-xl font-bold text-white/60 uppercase tracking-widest">Past Events Archive</h3>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    userId={user?.id} 
                    onRegister={handleRegister} 
                    isPast 
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default StudentEvents;
