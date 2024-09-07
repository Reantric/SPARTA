export class Loader {
    // Function to load the Excel file from a path (using Fetch)
    public async loadSPARTAData(filePath: string): Promise<any[]> {
        const response = await fetch(filePath); // Fetch the file from the server
        const blob = await response.blob(); // Convert response to Blob
        const arrayBuffer = await blob.arrayBuffer(); // Convert Blob to ArrayBuffer
        
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(arrayBuffer); // Load arrayBuffer into ExcelJS workbook
        
        const sheet = workbook.getWorksheet(1);  // Assuming the data is in the first sheet
        const spartaIdentifiers: any[] = [];

        // Parse each row, starting from row 2 (to skip the header row)
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) {
                const id = row.getCell(1).value?.toString() || '';
                const cwes = row.getCell(2).value?.toString().split(',').map(cwe => cwe.trim()) || [];
                const info = row.getCell(3).value?.toString() || '';
                
                // Create a SPARTA identifier and add it to the array
                spartaIdentifiers.push({ id, cwes, info });
            }
        });

        return spartaIdentifiers;
    }
}
