import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ListView = ({ data = [], columns = [], onItemClick, getStatusBadge }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedData = [...data].sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToPage = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  return (
    <Card className="animate-fade-in">
      <CardContent className="p-0 overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                {columns.map(col => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((item, index) => (
                <TableRow key={item._id || `item-${index}`}>
                  {columns.map(col => (
                    <TableCell key={col.key}>
                      {col.key === "name" || col.key === "title" ? (
                        <button 
                          onClick={() => onItemClick && onItemClick(item)} 
                          className="hover:text-[#ff077f] font-medium"
                        >
                          {item[col.key] || `No ${col.label}`}
                        </button>
                      ) : col.key === "status" && getStatusBadge ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(item[col.key])}`}>
                          {item[col.key] || "No Status"}
                        </span>
                      ) : (
                        item[col.key] || `No ${col.label}`
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {sortedData.length > itemsPerPage && (
          <div className="flex items-center justify-between p-4">
            <div className="text-sm text-gray-700">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedData.length)} of {sortedData.length} entries
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
      </CardContent>
    </Card>
  );
};

export default ListView;