import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const CalendarView = ({ data = [], eventMapper = () => [] }) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!Array.isArray(data)) return <p className="text-muted-foreground">Error loading data.</p>;

  const events = eventMapper(data);

  const handleEventClick = (info) => {
    setSelectedItem(info.event.extendedProps.item);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">📅 Calendar View</h2>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        height="auto"
      />
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
            <DialogDescription>
              {selectedItem && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold">
                    {selectedItem.name || selectedItem.title || "Untitled"}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    {selectedItem.company || selectedItem.description || "No Details"}
                  </span>
                  <span className="text-xs text-gray-500 block">
                    Date: {new Date(selectedItem.reminders?.[0]?.date || selectedItem.dueDate || selectedItem.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;