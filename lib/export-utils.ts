import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { saveAs } from "file-saver"

export const getRecordsForItem = (itemId: string, records: any[]) => {
    return records.filter(r => {
        if (itemId === "passwords" || itemId === "all-items" || itemId === "type-logins") return r.type === "password" || r.type === "login"
        if (itemId === "type-payment-cards" || itemId === "financial-cards") return r.type === "financial-card"
        if (itemId === "type-health-records") return r.type === "health-record" || r.type === "health"
        if (itemId === "type-medications") return r.type === "medication"
        if (itemId === "type-vitals") return r.type === "vitals"
        if (itemId === "type-health-diary") return r.type === "health-diary"
        if (itemId === "type-health-portals") return r.type === "health-portal"
        if (itemId === "type-doctors") return r.type === "doctor"
        if (itemId === "type-medical") return r.type === "medical-insurance" || r.type === "medical"
        
        // Default: try to match by removing "type-" suffix logic
        const inferredType = itemId.replace("type-", "")
        return r.type === inferredType || r.category?.toLowerCase() === inferredType.replace("-", " ")
    })
}

export const handleExport = (e: React.MouseEvent, item: any, records: any[], format: "pdf" | "csv" | "json") => {
    if (e) e.stopPropagation();
    
    const itemRecords = getRecordsForItem(item.id, records);
    if (itemRecords.length === 0) {
        toast.error(`No records found to export for ${item.label}`);
        return;
    }

    if (format === "json") {
        const blob = new Blob([JSON.stringify(itemRecords, null, 2)], { type: "application/json" });
        saveAs(blob, `SecureLifeHub_${item.label}_Export.json`);
        toast.success("JSON exported successfully");
    } else if (format === "csv") {
        const allKeysSet = new Set<string>();
        itemRecords.forEach(r => Object.keys(r).forEach(k => allKeysSet.add(k)));
        const allKeys = Array.from(allKeysSet);
        
        const csvRows = [
            allKeys.join(","),
            ...itemRecords.map(r => allKeys.map(k => {
                const val = r[k] || "";
                if (typeof val === 'object') return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(","))
        ];
        const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
        saveAs(blob, `SecureLifeHub_${item.label}_Export.csv`);
        toast.success("CSV exported successfully");
    } else if (format === "pdf") {
        try {
            const doc = new jsPDF()
            doc.text(`Secure Life Hub - ${item.label} Export`, 14, 15)
            doc.setFontSize(10)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22)
            doc.text(`Total Records: ${itemRecords.length}`, 14, 28)
            
            const tableData = itemRecords.map(r => [
                r.title || r.name || "Untitled",
                r.type || "",
                new Date(r.updatedAt || r.updated_at || r.createdAt || r.created_at || Date.now()).toLocaleDateString()
            ])
            
            autoTable(doc, {
                startY: 35,
                head: [["Name / Title", "Type", "Last Updated"]],
                body: tableData,
            })
            
            doc.save(`SecureLifeHub_${item.label}_Export.pdf`)
            toast.success("PDF exported successfully");
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate PDF");
        }
    }
}
