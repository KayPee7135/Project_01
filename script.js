// Get jobs from localStorage
function getJobs() {
  return JSON.parse(localStorage.getItem('jobs')) || [];
}

// Save jobs to localStorage
function saveJobs(jobs) {
  localStorage.setItem('jobs', JSON.stringify(jobs));
}

// Recruiter: Handle form submission
if (document.getElementById('jobForm')) {
  document.getElementById('jobForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const title = document.getElementById('title').value.trim();
    const company = document.getElementById('company').value.trim();
    const address = document.getElementById('address').value.trim();
    const jobType = document.getElementById('jobType').value;
    const description = document.getElementById('description').value.trim();
    const contact = document.getElementById('contact').value.trim();
    const category = document.getElementById('category').value.trim();
    const datePosted = document.getElementById('datePosted').value;
    const dueDate = document.getElementById('dueDate').value;
    const imageInput = document.getElementById('image');
    let image = '';

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Form validation
    if (!title || !company || !address || !jobType || !description || !contact || !category || !datePosted || !dueDate) {
      document.getElementById('message').textContent = 'Please fill out all required fields.';
      document.getElementById('message').className = 'text-danger';
      return;
    }

    // Validate email format
    if (!emailRegex.test(contact)) {
      document.getElementById('message').textContent = 'Please enter a valid email address.';
      document.getElementById('message').className = 'text-danger';
      return;
    }

    // Validate that Due Date is not before Posted Date
    if (new Date(dueDate) < new Date(datePosted)) {
      document.getElementById('message').textContent = 'Due Date cannot be earlier than the Posted Date.';
      document.getElementById('message').className = 'text-danger';
      return;
    }

    // Handle image upload
    if (imageInput.files && imageInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        image = e.target.result;

        // Create job object
        const job = { title, company, address, jobType, description, contact, category, datePosted, dueDate, image };
        const jobs = getJobs();
        jobs.push(job);
        saveJobs(jobs);

        // Success message
        document.getElementById('message').textContent = 'Job posted successfully!';
        document.getElementById('message').className = 'text-success';

        // Clear form
        document.getElementById('jobForm').reset();
      };
      reader.readAsDataURL(imageInput.files[0]);
    } else {
      // If no image is uploaded, save without image
      const job = { title, company, address, jobType, description, contact, category, datePosted, dueDate, image: '' };
      const jobs = getJobs();
      jobs.push(job);
      saveJobs(jobs);

      // Success message
      document.getElementById('message').textContent = 'Job posted successfully!';
      document.getElementById('message').className = 'text-success';

      // Clear form
      document.getElementById('jobForm').reset();
    }
  });
}

// Remove expired jobs
function removeExpiredJobs() {
  const jobs = getJobs();
  const today = new Date().toISOString().split('T')[0];
  const filteredJobs = jobs.filter(job => job.dueDate >= today);
  saveJobs(filteredJobs);
}

// Call removeExpiredJobs on page load
removeExpiredJobs();

// Job Seeker: Display jobs and search
if (document.getElementById('jobList')) {
  const jobList = document.getElementById('jobList');
  const search = document.getElementById('search');

  function displayJobs(filter = '') {
    const jobs = getJobs();
    jobList.innerHTML = '';
    jobs.forEach((job, index) => {
      if (
        job.title.toLowerCase().includes(filter.toLowerCase()) ||
        job.company.toLowerCase().includes(filter.toLowerCase()) ||
        job.category.toLowerCase().includes(filter.toLowerCase())
      ) {
        const card = document.createElement('div');
        card.className = 'col-sm-12 col-md-6 col-lg-4';
        card.innerHTML = `
          <div class="card h-100">
            ${job.image ? `<img src="${job.image}" class="card-img-top" alt="Job Image">` : ''}
            <div class="card-body d-flex flex-column">
              <h5>${job.title}</h5>
              <p><strong>Company:</strong> ${job.company}</p>
              <p><strong>Address:</strong> ${job.address}</p>
              <p><strong>Job Type:</strong> ${job.jobType}</p>
              <p><strong>Description:</strong> ${job.description}</p>
              <p><strong>Contact:</strong> ${job.contact}</p>
              <p><strong>Category:</strong> ${job.category}</p>
              <p><strong>Date Posted:</strong> ${job.datePosted}</p>
              <p><strong>Due Date:</strong> ${job.dueDate}</p>
              <button class="btn btn-primary mt-auto apply-btn" data-index="${index}">Apply Now</button>
            </div>
          </div>
        `;
        jobList.appendChild(card);
      }
    });

    // Add event listeners to "Apply Now" buttons
    const applyButtons = document.querySelectorAll('.apply-btn');
    applyButtons.forEach(button => {
      button.addEventListener('click', function () {
        const jobIndex = this.getAttribute('data-index');
        // Redirect to resume.html with job index as a query parameter
        window.location.href = `resume.html?jobId=${jobIndex}`;
      });
    });
  }

  displayJobs();

  search.addEventListener('input', function () {
    displayJobs(this.value);
  });
}

// Resume Submission: Display job details and handle form submission
if (document.getElementById('resumeForm')) {
  const form = document.getElementById('resumeForm');
  const message = document.getElementById('message');
  const jobDetails = document.createElement('div');
  jobDetails.className = 'alert alert-info text-center mb-4';

  // Get jobId from query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId');

  // Retrieve jobs from localStorage
  const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
  const job = jobs[jobId];

  // Display job details if available
  if (job) {
    jobDetails.innerHTML = `
      <h4>Applying for: ${job.title}</h4>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Description:</strong> ${job.description}</p>
    `;
    document.querySelector('.container').prepend(jobDetails);
  } else {
    console.error('Job not found for jobId:', jobId);
  }

  // Handle form submission
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const resumeInput = document.getElementById('resume');
    let resume = '';

    // Validate form fields
    if (!name || !email || !phone) {
      message.textContent = 'Please fill out all required fields.';
      message.className = 'text-danger';
      return;
    }

    // Validate file upload
    if (resumeInput.files && resumeInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (e) {
        resume = e.target.result;

        // Simulate saving application (you can replace this with an API call)
        const application = { jobId, name, email, phone, resume };
        console.log('Application Submitted:', application);

        // Show success message
        message.textContent = 'Application submitted successfully!';
        message.className = 'text-success';

        // Clear form
        form.reset();
      };
      reader.readAsDataURL(resumeInput.files[0]);
    } else {
      message.textContent = 'Please upload your resume.';
      message.className = 'text-danger';
    }
  });
}
