document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const loadingIndicator = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    if (uploadForm) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(uploadForm);
            const logFile = document.getElementById('logFile');

            // Reset previous state
            loadingIndicator.classList.remove('hidden');
            errorDiv.classList.add('hidden');

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    // Store the analysis result in session storage
                    sessionStorage.setItem('logAnalysis', JSON.stringify(data));
                    // Redirect to dashboard
                    window.location.href = '/dashboard';
                } else {
                    throw new Error(data.error || 'Unknown error occurred');
                }
            } catch (error) {
                loadingIndicator.classList.add('hidden');
                errorDiv.textContent = error.message;
                errorDiv.classList.remove('hidden');
            }
        });
    }

    // Dashboard page specific logic
    if (window.location.pathname === '/dashboard') {
        const analysisData = JSON.parse(sessionStorage.getItem('logAnalysis'));

        if (analysisData) {
            // Total statistics
            document.getElementById('totalLogs').textContent = analysisData.total_logs || '-';
            document.getElementById('uniqueUsers').textContent = analysisData.unique_users || '-';
            document.getElementById('uniqueIPs').textContent = analysisData.unique_ips || '-';
            document.getElementById('uniqueEvents').textContent = analysisData.unique_events || '-';

            // Severity breakdown
            const severityBreakdown = analysisData.severity_breakdown || {};
            document.getElementById('highSeverity').textContent = severityBreakdown.high || 0;
            document.getElementById('mediumSeverity').textContent = severityBreakdown.medium || 0;
            document.getElementById('lowSeverity').textContent = severityBreakdown.low || 0;

            // Suspicious logs
            const suspiciousLogsBody = document.getElementById('suspiciousLogsBody');
            const suspiciousLogs = analysisData.suspicious_logs || [];
            suspiciousLogsBody.innerHTML = suspiciousLogs.map(log => `
                <tr>
                    <td>${log.log}</td>
                    <td>${log.ip}</td>
                    <td>${log.reason}</td>
                </tr>
            `).join('');

            // Peak hours
            const peakHoursList = document.getElementById('peakHoursList');
            const peakHours = analysisData.peak_hours || [];
            peakHoursList.innerHTML = peakHours.map(hour => `
                <div class="peak-hour">
                    Hour ${hour.hour}: ${hour.count} logs
                </div>
            `).join('');
        }
    }
}); 