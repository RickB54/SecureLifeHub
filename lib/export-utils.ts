import { toast } from "sonner"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { saveAs } from "file-saver"

export const getRecordsForItem = (itemId: string, records: any[]) => {
    return records.filter(r => {
        const type = (r.type || "").toLowerCase();
        const cat = (r.category || "").toLowerCase();
        const meta = r.item_metadata || {};

        if (itemId === "passwords" || itemId === "all-items" || itemId === "type-logins") {
            return type === "password" || type === "login" || cat === "logins" || cat === "passwords";
        }
        if (itemId === "type-payment-cards" || itemId === "financial-cards") {
            return type === "financial-card" || type === "card" || cat === "payment cards" || meta.is_card;
        }
        if (itemId === "type-health-records") {
            return type === "health-record" || type === "health" || cat === "health records";
        }
        if (itemId === "type-medications") {
            return type === "medication" || cat === "medications";
        }
        if (itemId === "type-vitals") {
            return type === "vitals" || cat === "vitals" || meta.is_vital;
        }
        if (itemId === "type-health-diary") {
            return type === "health-diary" || cat === "health diary" || meta.is_diary;
        }
        if (itemId === "type-health-portals") {
            return type === "health-portal" || cat === "health portals";
        }
        if (itemId === "type-doctors") {
            return type === "doctor" || cat === "doctors";
        }
        if (itemId === "type-medical") {
            return type === "medical-insurance" || type === "medical" || cat === "health insurance" || cat === "medical";
        }
        if (itemId === "type-goals") {
            return type === "goal" || cat === "goals" || cat === "goals & timeline" || meta.is_goal;
        }
        if (itemId === "type-tasks") {
            return type === "architect-task" || type === "task" || cat === "tasks";
        }
        if (itemId === "type-subscriptions") {
            return type === "subscription" || cat === "subscriptions";
        }
        if (itemId === "type-budget") {
            return type === "budget" || cat === "budget" || meta.is_budget;
        }
        
        // Default: try to match by removing "type-" suffix logic
        const inferredType = itemId.replace("type-", "").replace(/-/g, " ");
        return type === inferredType || cat === inferredType || cat.includes(inferredType);
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
                const pageHeight = doc.internal.pageSize.getHeight();
                const margin = 14;
                const innerWidth = pageWidth - (margin * 2);

                itemRecords.forEach((r) => {
                    const notes = r.notes || "---";
                    const splitNotes = doc.splitTextToSize(notes, innerWidth - 35);
                    const notesHeight = splitNotes.length * 4.5; // Approximate height for wrapped text
                    
                    // Fixed header/field heights (Title + 4 rows) = approx 38
                    const boxHeight = 42 + notesHeight;

                    // Check if we need a new page for this box
                    if (currentY + boxHeight > pageHeight - 15) {
                        doc.addPage();
                        currentY = 20;
                    }

                    // Draw a box
                    doc.setDrawColor(220, 220, 220);
                    doc.setFillColor(249, 250, 251);
                    doc.rect(margin, currentY, innerWidth, boxHeight, 'FD');

                    // Title Header
                    doc.setFontSize(11);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(37, 99, 235); // Blue-600
                    doc.text(r.title || "Untitled Password", margin + 5, currentY + 8);

                    // Fields
                    doc.setFontSize(9);
                    doc.setTextColor(107, 114, 128); // Gray-500
                    doc.setFont("helvetica", "normal");
                    
                    const drawField = (label: string, value: string, y: number, isMono = false) => {
                        doc.setTextColor(107, 114, 128);
                        doc.setFont("helvetica", "normal");
                        doc.text(label, margin + 5, y);
                        
                        doc.setTextColor(31, 41, 55);
                        if (isMono) doc.setFont("courier", "bold");
                        else doc.setFont("helvetica", "normal");
                        doc.text(value || "---", margin + 30, y);
                    };

                    drawField("Folder:", getFolderTitle(r.folder_id), currentY + 16);
                    drawField("User ID:", r.username || r.email || "---", currentY + 22);
                    drawField("Password:", r.password || "---", currentY + 28, true);
                    drawField("Website:", r.website || "---", currentY + 34);
                    
                    // Notes (Special handling for wrapping)
                    doc.setTextColor(107, 114, 128);
                    doc.setFont("helvetica", "normal");
                    doc.text("Notes:", margin + 5, currentY + 40);
                    
                    doc.setTextColor(31, 41, 55);
                    doc.text(splitNotes, margin + 30, currentY + 40);

                    currentY += boxHeight + 10; // Space for next box
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

