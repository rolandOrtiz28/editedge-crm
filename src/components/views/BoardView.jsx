const BoardView = ({ data = [], onItemClick }) => {
  if (!Array.isArray(data)) return <p className="text-muted-foreground">Error loading data.</p>;

  return (
    <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
      {data.length === 0 ? (
        <p className="text-muted-foreground">No data available.</p>
      ) : (
        data.map((item) => (
          <div 
            key={item._id} 
            className="p-4 border rounded shadow-sm cursor-pointer hover:bg-gray-50" 
            onClick={() => onItemClick && onItemClick(item)}
          >
            <h3 className="font-medium">{item.name || item.title || "Untitled"}</h3>
            <p className="text-sm text-muted-foreground">
              {item.company || item.description || "No Details"}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default BoardView;