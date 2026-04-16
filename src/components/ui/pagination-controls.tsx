import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    itemsPerPage?: number;
    onItemsPerPageChange?: (limit: number) => void;
    totalItems: number;
}

export function PaginationControls({
    currentPage,
    totalPages,
    onPageChange,
    itemsPerPage,
    onItemsPerPageChange,
    totalItems,
}: PaginationControlsProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            <div className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing{' '}
                <span className="font-medium">
                    {itemsPerPage ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems) : 0}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                    {itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : totalItems}
                </span>{' '}
                of <span className="font-medium">{totalItems}</span> results
            </div>

            <div className="flex items-center gap-2 order-1 sm:order-2">
                {itemsPerPage && onItemsPerPageChange && (
                    <div className="flex items-center gap-2 mr-4">
                        <span className="text-sm text-muted-foreground whitespace-nowrap">Rows per page</span>
                        <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => {
                                onItemsPerPageChange(Number(value));
                                onPageChange(1); // Reset to first page
                            }}
                        >
                            <SelectTrigger className="h-8 w-[70px]">
                                <SelectValue placeholder={itemsPerPage} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                        <span className="sr-only">First page</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>

                    <div className="text-sm font-medium mx-2">
                        Page {currentPage} of {totalPages}
                    </div>

                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(totalPages)}
                        disabled={currentPage >= totalPages}
                    >
                        <ChevronsRight className="h-4 w-4" />
                        <span className="sr-only">Last page</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
