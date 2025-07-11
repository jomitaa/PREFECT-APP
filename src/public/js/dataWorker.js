// /js/dataWorker.js
self.onmessage = function(e) {
    const { data, hayFiltrosActivos } = e.data;
    
    let processedData;
    if (hayFiltrosActivos) {
        processedData = data;
    } else {
        processedData = data
            .sort((a, b) => new Date(b.fecha_asistencia) - new Date(a.fecha_asistencia))
            .slice(0, 50);
    }
    
    self.postMessage(processedData);
    self.close();
};