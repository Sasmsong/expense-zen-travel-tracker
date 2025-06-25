
import { FileText, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Expense } from "@/pages/Index";

interface ExportOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  categoryTotals: { [key: string]: number };
  tripName: string;
}

export const ExportOptions = ({ isOpen, onClose, expenses, categoryTotals, tripName }: ExportOptionsProps) => {
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const generateCSV = () => {
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...expenses.map(expense => [
        expense.date,
        `"${expense.merchant}"`,
        expense.category,
        expense.amount,
        `"${expense.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripName.replace(/\s+/g, '_')}_expenses.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const reportContent = `
${tripName} - Expense Report
Generated: ${new Date().toLocaleDateString()}

SUMMARY:
Total Expenses: $${totalAmount.toFixed(2)}
Number of Receipts: ${expenses.length}

CATEGORY BREAKDOWN:
${Object.entries(categoryTotals)
  .map(([category, amount]) => `${category}: $${amount.toFixed(2)}`)
  .join('\n')}

DETAILED EXPENSES:
${expenses
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map(expense => `${expense.date} | ${expense.merchant} | ${expense.category} | $${expense.amount.toFixed(2)}`)
  .join('\n')}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tripName.replace(/\s+/g, '_')}_report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareByEmail = () => {
    const subject = encodeURIComponent(`${tripName} - Expense Report`);
    const body = encodeURIComponent(`
Hi,

Please find the expense report for ${tripName}:

Total Amount: $${totalAmount.toFixed(2)}
Number of Receipts: ${expenses.length}

Category Breakdown:
${Object.entries(categoryTotals)
  .map(([category, amount]) => `• ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

Best regards
    `);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[70vh]">
        <SheetHeader>
          <SheetTitle>Export Options</SheetTitle>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Trip Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-bold">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Receipts:</span>
                  <span className="font-bold">{expenses.length}</span>
                </div>
                <div className="text-sm text-gray-600 mt-3">
                  <div className="font-medium mb-1">By Category:</div>
                  {Object.entries(categoryTotals).map(([category, amount]) => (
                    <div key={category} className="flex justify-between">
                      <span>{category}:</span>
                      <span>${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export Actions */}
          <div className="space-y-3">
            <Button 
              onClick={generateCSV}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <FileText className="w-4 h-4 mr-2" />
              Download CSV (Excel Compatible)
            </Button>
            
            <Button 
              onClick={generateReport}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Text Report
            </Button>
            
            <Button 
              onClick={shareByEmail}
              variant="outline"
              className="w-full"
            >
              <Mail className="w-4 h-4 mr-2" />
              Share via Email
            </Button>
          </div>

          <Button variant="outline" onClick={onClose} className="w-full mt-4">
            Close
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
