import { useState, useEffect } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

const KanbanView = ({ data = [], statusOptions = [], onUpdateStatus, onItemClick, getStatusBadge }) => {
  const [items, setItems] = useState(data);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (items.length !== data.length) {
      setItems(data);
      setCurrentPage(1);
    } else {
      setItems(data);
    }
  }, [data, items.length]);

  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const moveItem = (itemId, newStatus) => {
    if (onUpdateStatus && typeof onUpdateStatus === "function") {
      const updatedItems = items.map(item => item._id === itemId ? { ...item, status: newStatus } : item);
      setItems(updatedItems);
      onUpdateStatus(itemId, newStatus);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 p-4 bg-brand-black text-white rounded-md">
          {statusOptions.map(status => (
            <KanbanColumn 
              key={status} 
              status={status} 
              items={currentItems} 
              moveItem={moveItem} 
              onItemClick={onItemClick} 
              getStatusBadge={getStatusBadge}
            />
          ))}
        </div>
        {totalItems > itemsPerPage && (
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-700">
              Showing <span>{indexOfFirstItem + 1}</span>-<span>{Math.min(indexOfLastItem, totalItems)}</span> of <span>{totalItems}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-3 py-1 rounded ${currentPage === page ? "bg-brand-black text-white" : "bg-gray-200"}`}
                >
                  {page}
                </button>
              ))}
                </div>
              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                    Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
};

const KanbanColumn = ({ status, items, moveItem, onItemClick, getStatusBadge }) => {
  const [, drop] = useDrop({
    accept: "item",
    drop: (item) => moveItem(item.id, status),
  });

  const columnItems = items
    .filter(item => item.status === status)
    .sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));

  return (
    <div ref={drop} className="p-2 rounded-lg min-h-[300px] flex flex-col">
      <h3 className="text-lg font-bold mb-3">{status}</h3>
      <div className="flex-1">
        {columnItems.map(item => (
          <KanbanCard key={item._id} item={item} onItemClick={onItemClick} getStatusBadge={getStatusBadge} />
        ))}
      </div>
    </div>
  );
};

const KanbanCard = ({ item, onItemClick, getStatusBadge }) => {
  const [{ isDragging }, drag] = useDrag({
    type: "item",
    item: { id: item._id },
    collect: (monitor) => ({ isDragging: !!monitor.isDragging() }),
  });

  const borderColor = getStatusBadge ? getStatusBadge(item.status).replace("bg-", "border-") : "border-gray-500";

  return (
    <Card
      ref={drag}
      className={`mb-4 bg-white border-l-4 ${borderColor} rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-grab ${isDragging ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
      onClick={() => onItemClick && onItemClick(item)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-semibold text-gray-800 hover:text-blue-600">
              {item.name || item.title || "Untitled"}
            </h4>
            {getStatusBadge && (
              <span className={`text-sm px-2 py-1 rounded-full ${getStatusBadge(item.status)}`}>
                {item.status}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600">
            {item.company || item.description || "No Details"}
          </p>
          <div className="text-xs text-gray-500">
            {new Date(item.createdAt || item.dueDate || Date.now()).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KanbanView;