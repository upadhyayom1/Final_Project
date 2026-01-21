// student.js

// 1. SECURITY CHECK: Kick user out if not logged in as student
const currentUser = checkAuth('student');
document.getElementById('welcome-msg').innerText = `Welcome, ${currentUser.email}`;

// 2. Load data on startup
document.addEventListener('DOMContentLoaded', async () => {
    await loadIssues();
});

async function loadIssues() {
    document.getElementById('loading').style.display = 'block';
    
    // Fetch data using our Async Bridge
    const issues = await getIssues();
    
    document.getElementById('loading').style.display = 'none';
    const container = document.getElementById('student-issues-list');
    container.innerHTML = '';

    if (issues.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:gray;">No reports yet. Good job!</p>';
        return;
    }

    issues.forEach(issue => {
        // Decide badge color
        const badgeClass = issue.status === 'Resolved' ? 'badge-green' : 'badge-red';
        
        // Logic for "Before vs After" Display
        let imageHTML = '';
        if (issue.status === 'Resolved' && issue.admin_image) {
            imageHTML = `
                <div class="comparison-grid">
                    <div>
                        <span class="comparison-label">Your Report</span>
                        <img src="${issue.student_image}">
                    </div>
                    <div>
                        <span class="comparison-label">Fixed by Admin</span>
                        <img src="${issue.admin_image}">
                    </div>
                </div>`;
        } else if (issue.student_image) {
            imageHTML = `<img src="${issue.student_image}">`;
        }

        const html = `
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong>${issue.title}</strong>
                    <span class="badge ${badgeClass}">${issue.status}</span>
                </div>
                ${imageHTML}
                <div style="margin-top:10px; font-size:0.8rem; color:gray;">
                    Reported on: ${new Date(issue.id).toLocaleDateString()}
                </div>
            </div>
        `;
        container.innerHTML += html;
    });
}

// 3. Handle New Report Submission
async function handleSubmit() {
    const title = document.getElementById('title').value;
    const fileInput = document.getElementById('fileInput');

    if (!title) return alert("Please enter a title");
    if (!fileInput.files[0]) return alert("Please upload a photo evidence");

    const reader = new FileReader();

    reader.onloadend = async function() {
        const base64Image = reader.result;

        const newIssue = {
            id: Date.now(),
            title: title,
            student_image: base64Image,
            admin_image: null,
            status: "Pending",
            reportedBy: currentUser.email
        };

        await createIssue(newIssue);

        // Reset Form
        document.getElementById('title').value = '';
        fileInput.value = '';
        alert("Report Submitted Successfully!");
        loadIssues(); // Refresh the list
    };

    reader.readAsDataURL(fileInput.files[0]);
}