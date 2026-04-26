import React, { useState, useEffect } from 'react';
import { Calendar, Plus, MapPin, Users, Trash2, Clock } from 'lucide-react';
import { Card, Button, Input, TextArea } from '../../components/common/UI';
import { firebaseService } from '../../services/firebaseService';
import { Event } from '../../types';
import { formatDate, cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const TeacherEventCard = ({ event, isPast }: { event: Event; isPast?: boolean; key?: string }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
  >
    <Card className={cn(
      "p-10 hover:shadow-2xl transition-all duration-300",
      isPast ? "opacity-60 saturate-50 bg-slate-50/50" : "bg-white"
    )}>
      <div className="flex justify-between items-start mb-8">
        <div className={cn(
          "w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-inner",
          isPast ? "bg-slate-100 text-slate-400" : "bg-purple-100 text-purple-600"
        )}>
          <Calendar className="w-8 h-8" />
        </div>
        <div className="flex gap-2">
          <div className={cn(
            "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-sm",
            isPast ? "bg-slate-100 text-slate-500" : "bg-purple-50 text-purple-700"
          )}>
            {isPast ? "Concluded" : "Upcoming"}
          </div>
        </div>
      </div>

      <h4 className="text-2xl font-black text-slate-800 mb-2">{event.title}</h4>
      <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed">{event.description}</p>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center">
          <Clock className="w-5 h-5 text-slate-300 mr-3" />
          <span className="text-xs font-bold text-slate-600">{formatDate(event.date)}</span>
        </div>
        <div className="bg-slate-50 p-4 rounded-2xl flex items-center">
          <MapPin className="w-5 h-5 text-slate-300 mr-3" />
          <span className="text-xs font-bold text-slate-600 truncate">{event.location}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-8 border-t border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white" />)}
          </div>
          <span className="text-xs font-bold text-slate-400">{event.attendees.length} Students Registered</span>
        </div>
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 p-2">
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </Card>
  </motion.div>
);

const TeacherEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isAdding, setIsAdding] = useState(false);
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

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const date = formData.get('date') as string;
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;

    await firebaseService.addEvent({
      title,
      description,
      date: new Date(date).toISOString(),
      location,
      attendees: []
    });

    setIsAdding(false);
    const data = await firebaseService.getEvents();
    setEvents(data as Event[]);
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Event Coordination</h2>
        <Button onClick={() => setIsAdding(true)} className="rounded-2xl h-12">
          <Plus className="w-5 h-5 mr-2" />
          Schedule Event
        </Button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-10 border-purple-500/50 bg-white/95">
              <h3 className="text-2xl font-bold text-purple-900 mb-8">Schedule New Event</h3>
              <form onSubmit={handleAddEvent} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Event Title</label>
                      <Input name="title" placeholder="e.g. Annual Tech Symposium" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Date</label>
                        <Input name="date" type="date" required />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Location</label>
                        <Input name="location" placeholder="Building 4, Lab 2" required />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-1">Detailed Description</label>
                    <TextArea name="description" placeholder="What is this event about?" className="h-full" required />
                  </div>
                </div>
                <div className="flex gap-4 pt-6 border-t border-slate-100">
                  <Button type="submit" className="flex-1 h-14 rounded-2xl bg-purple-600 hover:bg-purple-700 shadow-purple-200">Publish Event</Button>
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-12">
        {loading ? (
          <div className="col-span-full py-20 text-center text-white/50 italic">Syncing event calendar...</div>
        ) : (
          <>
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white opacity-80 uppercase tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                Upcoming Events
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                {upcomingEvents.map(event => <TeacherEventCard key={event.id} event={event} />)}
                {upcomingEvents.length === 0 && (
                  <div className="col-span-full py-12 text-center bg-white/5 rounded-3xl border border-white/10 text-white/40 italic">
                    No scheduled events. Click "Schedule Event" to start.
                  </div>
                )}
              </div>
            </section>

            {pastEvents.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-lg font-bold text-white opacity-40 uppercase tracking-widest flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-white/20"></div>
                  Event History
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.map(event => <TeacherEventCard key={event.id} event={event} isPast />)}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherEvents;
