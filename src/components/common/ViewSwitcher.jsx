import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListView from "@/components/views/ListView";
import KanbanView from "@/components/views/KanbanView";
import CalendarView from "@/components/views/CalendarView";
import BoardView from "@/components/views/BoardView";

const ViewSwitcher = ({ view, setView, data, viewConfig, onItemClick, onUpdateStatus }) => {
  // Default to empty config if not provided
  const config = viewConfig || {};

  return (
    <Tabs value={view} onValueChange={setView} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="kanban">Kanban</TabsTrigger>
        <TabsTrigger value="calendar">Calendar</TabsTrigger>
        <TabsTrigger value="board">Board</TabsTrigger>
      </TabsList>

      {/* Render Views with Configurable Props */}
      {view === "list" && (
        <ListView 
          data={data} 
          columns={config.columns || []} 
          onItemClick={onItemClick} 
          getStatusBadge={config.getStatusBadge}
        />
      )}
      {view === "kanban" && (
        <KanbanView 
          data={data} 
          statusOptions={config.statusOptions || []} 
          onItemClick={onItemClick} 
          onUpdateStatus={onUpdateStatus} // Optional, only for pages with status updates
          getStatusBadge={config.getStatusBadge}
        />
      )}
      {view === "calendar" && (
        <CalendarView 
          data={data} 
          eventMapper={config.eventMapper || (() => [])}
        />
      )}
      {view === "board" && (
        <BoardView 
          data={data} 
          onItemClick={onItemClick}
        />
      )}
    </Tabs>
  );
};

export default ViewSwitcher;