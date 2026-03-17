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

    const isPasswordExport = item.id === "passwords" || item.id === "type-logins" || item.id === "all-items";

    // Helper to get folder name
    const getFolderTitle = (folderId: string) => {
        if (!folderId) return "No Folder";
        const folder = records.find(r => r.id === folderId && r.type === "folder");
        return folder ? folder.title || folder.name : "Unknown Folder";
    };

    if (format === "json") {
        let exportData = itemRecords;
        if (isPasswordExport) {
            exportData = itemRecords.map(r => ({
                "Folder Title": getFolderTitle(r.folder_id),
                "User ID / Login": r.username || r.email || "",
                "Password": r.password || "",
                "Website": r.website || "",
                "Notes": r.notes || ""
            }));
        }
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
        saveAs(blob, `SecureLifeHub_${item.label}_Export.json`);
        toast.success("JSON exported successfully");
    } else if (format === "csv") {
        let allKeys: string[] = [];
        let dataRows: any[] = [];

        if (isPasswordExport) {
            allKeys = ["Folder Title", "User ID / Login", "Password", "Website", "Notes"];
            dataRows = itemRecords.map(r => ({
                "Folder Title": getFolderTitle(r.folder_id),
                "User ID / Login": r.username || r.email || "",
                "Password": r.password || "",
                "Website": r.website || "",
                "Notes": r.notes || ""
            }));
        } else {
            const allKeysSet = new Set<string>();
            itemRecords.forEach(r => Object.keys(r).forEach(k => allKeysSet.add(k)));
            allKeys = Array.from(allKeysSet);
            dataRows = itemRecords;
        }
        
        const csvRows = [
            allKeys.join(","),
            ...dataRows.map(r => allKeys.map(k => {
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
            doc.setFontSize(18)
            doc.setTextColor(40, 40, 40)
            doc.text(`Secure Life Hub - ${item.label} Export`, 14, 20)
            
            doc.setFontSize(10)
            doc.setTextColor(100, 100, 100)
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 28)
            doc.text(`Total Records: ${itemRecords.length}`, 14, 34)
            
            if (isPasswordExport) {
                // For passwords, use a more structured layout with boxes
                let currentY = 45;
                const pageWidth = doc.internal.pageSize.getWidth();
                const margin = 14;
                const innerWidth = pageWidth - (margin * 2);

                itemRecords.forEach((r, index) => {
                    // Check if we need a new page
                    if (currentY > 250) {
                        doc.addPage();
                        currentY = 20;
                    }

                    // Draw a box
                    doc.setDrawColor(200, 200, 200);
                    doc.setFillColor(249, 250, 251);
                    doc.rect(margin, currentY, innerWidth, 50, 'FD');

                    // Title Header
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(37, 99, 235); // Blue-600
                    doc.text(r.title || "Untitled Password", margin + 5, currentY + 8);

                    // Fields
                    doc.setFontSize(9);
                    doc.setTextColor(107, 114, 128); // Gray-500
                    doc.setFont("helvetica", "normal");
                    
                    doc.text("Folder:", margin + 5, currentY + 16);
                    doc.setTextColor(31, 41, 55);
                    doc.text(getFolderTitle(r.folder_id), margin + 30, currentY + 16);

                    doc.setTextColor(107, 114, 128);
                    doc.text("User ID:", margin + 5, currentY + 22);
                    doc.setTextColor(31, 41, 55);
                    doc.text(r.username || r.email || "---", margin + 30, currentY + 22);

                    doc.setTextColor(107, 114, 128);
                    doc.text("Password:", margin + 5, currentY + 28);
                    doc.setTextColor(31, 41, 55);
                    doc.setFont("courier", "bold");
                    doc.text(r.password || "---", margin + 30, currentY + 28);
                    doc.setFont("helvetica", "normal");

                    doc.setTextColor(107, 114, 128);
                    doc.text("Website:", margin + 5, currentY + 34);
                    doc.setTextColor(37, 99, 235);
                    doc.text(r.website || "---", margin + 30, currentY + 34);

                    doc.setTextColor(107, 114, 128);
                    doc.text("Notes:", margin + 5, currentY + 40);
                    doc.setTextColor(31, 41, 55);
                    const notes = r.notes || "---";
                    const splitNotes = doc.splitTextToSize(notes, innerWidth - 35);
                    doc.text(splitNotes, margin + 30, currentY + 40);

                    currentY += 60; // Space for next box
                });
            } else {
                const tableData = itemRecords.map(r => [
                    r.title || r.name || "Untitled",
                    r.type || "",
                    new Date(r.updatedAt || r.updated_at || r.createdAt || r.created_at || Date.now()).toLocaleDateString()
                ])
                
                autoTable(doc, {
                    startY: 40,
                    head: [["Name / Title", "Type", "Last Updated"]],
                    body: tableData,
                    theme: 'grid',
                    headStyles: { fillColor: [37, 99, 235] }
                })
            }
            
            doc.save(`SecureLifeHub_${item.label}_Export.pdf`)
            toast.success("PDF exported successfully");
        } catch (err) {
            console.error(err)
            toast.error("Failed to generate PDF");
        }
    }
}

